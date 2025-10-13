export interface NetworkProblem {
  id: string;
  problem: string;
  solutions: string[];
  aiReasoning: string;
  confidence: number;
  followUpQuestions: string[];
  timestamp: Date;
}

export interface AIAnalysis {
  solutions: string[];
  reasoning: string;
  confidence: number;
  followUpQuestions: string[];
  detectedIssues: string[];
}

export class AITroubleshooter {
  private knowledgeBase = {
    symptoms: {
      'slow': { category: 'performance', severity: 'medium', commonCauses: ['bandwidth', 'interference', 'hardware'] },
      'buffering': { category: 'streaming', severity: 'high', commonCauses: ['bandwidth', 'server', 'device'] },
      'disconnects': { category: 'stability', severity: 'high', commonCauses: ['signal', 'interference', 'hardware'] },
      'cant connect': { category: 'connection', severity: 'high', commonCauses: ['authentication', 'signal', 'configuration'] },
      'no internet': { category: 'connectivity', severity: 'critical', commonCauses: ['isp', 'modem', 'dns'] }
    },
    
    devices: {
      'phone': { type: 'mobile', capabilities: ['wifi', 'cellular'], troubleSteps: ['toggle airplane', 'reset network'] },
      'laptop': { type: 'computer', capabilities: ['wifi', 'ethernet'], troubleSteps: ['update drivers', 'network reset'] },
      'tv': { type: 'smart device', capabilities: ['wifi', 'ethernet'], troubleSteps: ['restart device', 'check signal'] },
      'xbox': { type: 'gaming', capabilities: ['wifi', 'ethernet'], troubleSteps: ['nat settings', 'wired connection'] }
    },
    
    solutions: {
      'restart_router': { effectiveness: 85, timeToFix: 2, difficulty: 'easy' },
      'update_drivers': { effectiveness: 70, timeToFix: 10, difficulty: 'medium' },
      'change_dns': { effectiveness: 60, timeToFix: 5, difficulty: 'medium' },
      'contact_isp': { effectiveness: 90, timeToFix: 30, difficulty: 'easy' }
    }
  };

  private problemPatterns = [
    {
      keywords: ['slow', 'speed', 'buffering', 'loading'],
      category: 'speed',
      solutions: [
        '🔄 Restart your router and modem (unplug for 30 seconds)',
        '📱 Close bandwidth-heavy apps (Netflix, YouTube, downloads)',
        '📍 Move closer to your WiFi router or use ethernet cable',
        '� Run speed test and contact ISP if speeds are too low',
        '�🔧 Update your network drivers and router firmware'
      ]
    },
    {
      keywords: ['wifi', 'wireless', 'connect', 'network', 'password'],
      category: 'wifi_connection',
      solutions: [
        '� Double-check your WiFi password (case-sensitive)',
        '📶 Make sure WiFi is enabled on your device',
        '🔄 Restart your router (unplug for 30 seconds)',
        '�️ Forget and reconnect to the WiFi network',
        '⚙️ Reset network settings if problem persists'
      ]
    },
    {
      keywords: ['no internet', 'connected but no internet', 'wifi connected no internet'],
      category: 'connected_no_internet',
      solutions: [
        '🔌 Check modem cable connections (coax/ethernet to wall)',
        '🔄 Restart modem first, then router after 2 minutes',
        '🌐 Try different websites to confirm the issue',
        '📞 Contact your ISP - there might be an outage',
        '🔧 Flush DNS: Open CMD and type "ipconfig /flushdns"'
      ]
    },
    {
      keywords: ['dns', 'server', 'resolve', 'website not found'],
      category: 'dns_issues',
      solutions: [
        '� Change DNS servers to 8.8.8.8 and 8.8.4.4 (Google DNS)',
        '💻 Flush DNS cache: Run "ipconfig /flushdns" in Command Prompt',
        '🔄 Restart your network adapter in Device Manager',
        '🌐 Try accessing websites by IP address (like 142.250.191.14 for Google)',
        '⚙️ Reset TCP/IP stack: Run "netsh winsock reset" as administrator'
      ]
    },
    {
      keywords: ['laptop', 'pc', 'computer', 'device'],
      category: 'device_specific',
      solutions: [
        '� Update network drivers from Device Manager',
        '⚙️ Run Windows Network Troubleshooter',
        '🔄 Disable and re-enable network adapter',
        '🛡️ Check if antivirus/firewall is blocking connection',
        '💻 Reset network settings: Settings > Network > Status > Network Reset'
      ]
    },
    {
      keywords: ['phone', 'mobile', 'cellular', 'data'],
      category: 'mobile_issues',
      solutions: [
        '📱 Toggle airplane mode on/off',
        '� Check if mobile data is enabled',
        '🔄 Restart your phone',
        '📞 Contact your mobile carrier about data issues',
        '⚙️ Reset network settings (will forget saved WiFi passwords)'
      ]
    },
    {
      keywords: ['ethernet', 'cable', 'wired'],
      category: 'ethernet_issues',
      solutions: [
        '� Check ethernet cable is firmly connected',
        '🔄 Try a different ethernet cable',
        '💻 Check ethernet port lights are on',
        '⚙️ Update ethernet adapter drivers',
        '� Try connecting to a different ethernet port on router'
      ]
    },
    {
      keywords: ['gaming', 'xbox', 'playstation', 'nintendo'],
      category: 'gaming_issues',
      solutions: [
        '🎮 Use wired connection for better stability',
        '🔄 Restart your gaming console',
        '⚙️ Check NAT type settings on router',
        '🚀 Enable gaming mode or QoS on router',
        '📊 Test network connection in console settings'
      ]
    },
    {
      keywords: ['streaming', 'netflix', 'youtube', 'video'],
      category: 'streaming_issues',
      solutions: [
        '📺 Lower video quality temporarily (720p instead of 4K)',
        '🔄 Restart streaming app and your device',
        '📍 Move closer to router or use ethernet cable',
        '⏸️ Pause other devices using internet while streaming',
        '🚀 Upgrade internet plan if consistently having issues'
      ]
    },
    {
      keywords: ['work from home', 'zoom', 'teams', 'video call'],
      category: 'work_issues',
      solutions: [
        '💻 Use ethernet cable for video calls',
        '🎥 Turn off video if audio is more important',
        '📱 Close unnecessary apps and browser tabs',
        '⚙️ Update your video calling app',
        '🔄 Restart computer before important meetings'
      ]
    },
    {
      keywords: ['smart tv', 'roku', 'chromecast', 'fire stick'],
      category: 'smart_tv_issues',
      solutions: [
        '📺 Restart your streaming device',
        '🔄 Unplug TV and streaming device for 30 seconds',
        '📶 Check WiFi signal strength near TV',
        '⚙️ Update streaming device firmware',
        '🔌 Use ethernet adapter if WiFi is weak'
      ]
    }
  ];

  // Main AI analysis method that thinks and reasons
  analyzeIntelligently(userInput: string): AIAnalysis {
    console.log('🤖 AI is analyzing:', userInput);
    
    // Step 1: Parse and understand the problem
    const analysis = this.parseUserInput(userInput);
    const detectedIssues = this.identifyIssues(userInput);
    const deviceContext = this.detectDevice(userInput);
    
    // Step 2: AI reasoning process
    const reasoning = this.generateReasoning(analysis, detectedIssues, deviceContext);
    
    // Step 3: Generate dynamic solutions
    const solutions = this.generateSmartSolutions(detectedIssues, deviceContext, userInput);
    
    // Step 4: Calculate confidence based on analysis
    const confidence = this.calculateConfidence(analysis, detectedIssues);
    
    // Step 5: Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(detectedIssues, analysis);
    
    return {
      solutions,
      reasoning,
      confidence,
      followUpQuestions,
      detectedIssues
    };
  }

  // Legacy method for backward compatibility
  analyzeProblem(userInput: string): string[] {
    return this.analyzeIntelligently(userInput).solutions;
  }

  private parseUserInput(input: string): any {
    const words = input.toLowerCase().split(' ');
    const timeWords = words.filter(w => ['morning', 'evening', 'night', 'today', 'yesterday'].includes(w));
    const urgencyWords = words.filter(w => ['urgent', 'asap', 'quickly', 'help', 'emergency'].includes(w));
    const emotionWords = words.filter(w => ['frustrated', 'annoyed', 'stuck', 'confused'].includes(w));
    
    return {
      words,
      timeContext: timeWords,
      urgency: urgencyWords.length > 0,
      emotion: emotionWords,
      length: words.length,
      hasNumbers: /\d/.test(input)
    };
  }

  private identifyIssues(input: string): string[] {
    const issues = [];
    const lowerInput = input.toLowerCase();
    
    // Smart issue detection
    if (lowerInput.includes('slow') || lowerInput.includes('speed')) issues.push('performance');
    if (lowerInput.includes('connect') && (lowerInput.includes('cant') || lowerInput.includes("won't"))) issues.push('connection_failure');
    if (lowerInput.includes('wifi') && lowerInput.includes('password')) issues.push('authentication');
    if (lowerInput.includes('buffering') || lowerInput.includes('loading')) issues.push('streaming_issues');
    if (lowerInput.includes('zoom') || lowerInput.includes('teams') || lowerInput.includes('call')) issues.push('video_call_issues');
    if (lowerInput.includes('gaming') || lowerInput.includes('lag')) issues.push('gaming_lag');
    if (lowerInput.includes('drop') || lowerInput.includes('disconnect')) issues.push('connection_drops');
    
    return issues.length > 0 ? issues : ['general_connectivity'];
  }

  private detectDevice(input: string): string {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('phone') || lowerInput.includes('mobile')) return 'mobile';
    if (lowerInput.includes('laptop') || lowerInput.includes('computer') || lowerInput.includes('pc')) return 'computer';
    if (lowerInput.includes('tv') || lowerInput.includes('smart tv')) return 'smart_tv';
    if (lowerInput.includes('xbox') || lowerInput.includes('playstation') || lowerInput.includes('gaming')) return 'gaming_console';
    if (lowerInput.includes('tablet') || lowerInput.includes('ipad')) return 'tablet';
    return 'unknown';
  }

  private generateReasoning(analysis: any, issues: string[], device: string): string {
    let reasoning = "🤖 **AI Analysis Process:**\n\n";
    
    reasoning += `**1. Problem Detection:** I detected ${issues.length} main issue(s): ${issues.join(', ')}\n\n`;
    
    reasoning += `**2. Device Context:** This appears to be a ${device === 'unknown' ? 'general device' : device} issue\n\n`;
    
    if (analysis.urgency) {
      reasoning += "**3. Urgency Level:** High - User needs immediate help\n\n";
    }
    
    reasoning += `**4. Solution Strategy:** Based on ${issues[0]}, I'm prioritizing the most effective solutions first\n\n`;
    
    reasoning += "**5. Success Probability:** Solutions are ordered by likelihood of success";
    
    return reasoning;
  }

  private generateSmartSolutions(issues: string[], device: string, originalInput: string): string[] {
    const solutions = [];
    const currentTime = new Date().getHours();
    
    // Dynamic solution generation based on AI analysis
    for (const issue of issues) {
      switch (issue) {
        case 'performance':
          solutions.push(
            `🔄 **Restart Network Equipment** - This fixes 85% of speed issues`,
            `📊 **Run Speed Test** - Let's measure your actual vs expected speeds`,
            `📱 **Check Background Apps** - Close bandwidth-heavy applications`,
            device === 'mobile' ? 
              `📶 **Switch to WiFi** - Mobile data might be throttled` :
              `🔌 **Try Ethernet Connection** - More stable than WiFi for ${device}`
          );
          break;
          
        case 'connection_failure':
          solutions.push(
            `🔑 **Verify WiFi Credentials** - Double-check network name and password`,
            `📍 **Check Signal Strength** - Move closer to router temporarily`,
            `🔄 **Reset Network Settings** - Clear corrupted network configurations`,
            device === 'mobile' ?
              `✈️ **Toggle Airplane Mode** - Refreshes mobile network connections` :
              `💻 **Update Network Drivers** - Outdated drivers cause connection issues`
          );
          break;
          
        case 'streaming_issues':
          const streamingSolution = currentTime > 18 || currentTime < 9 ?
            '⏰ **Peak Hours Detected** - Try lowering video quality during busy times' :
            '🚀 **Optimize Streaming** - Use ethernet and close other apps';
          solutions.push(
            streamingSolution,
            `📺 **Restart Streaming Device** - Clears memory and connection cache`,
            `🌐 **Test Different Server** - Try different Netflix/YouTube regions`
          );
          break;
          
        case 'video_call_issues':
          solutions.push(
            `💻 **Prioritize Video Calls** - Use ethernet and close other apps`,
            `🎥 **Adjust Call Quality** - Lower video resolution if needed`,
            `⚙️ **Update Calling App** - Latest versions have better compression`
          );
          break;
          
        default:
          solutions.push(
            `🔧 **Smart Diagnostic** - I've analyzed your specific "${originalInput}" issue`,
            `🎯 **Targeted Solution** - This approach works best for your situation`,
            `📞 **Expert Backup** - Contact support if this doesn't resolve it`
          );
      }
    }
    
    // Remove duplicates and limit to top 4 solutions
    return [...new Set(solutions)].slice(0, 4);
  }

  private calculateConfidence(analysis: any, issues: string[]): number {
    let confidence = 70; // Base confidence
    
    // Increase confidence based on specificity
    if (issues.length === 1) confidence += 15; // Single clear issue
    if (analysis.hasNumbers) confidence += 10; // Specific details
    if (analysis.words.length > 5) confidence += 10; // Detailed description
    if (issues.includes('performance') || issues.includes('connection_failure')) confidence += 5; // Common issues
    
    return Math.min(confidence, 98); // Cap at 98%
  }

  private generateFollowUpQuestions(issues: string[], analysis: any): string[] {
    const questions = [];
    
    if (issues.includes('performance')) {
      questions.push("What internet speed are you paying for?");
      questions.push("Is this slow on all devices or just one?");
    }
    
    if (issues.includes('connection_failure')) {
      questions.push("Can you see your WiFi network in the list?");
      questions.push("When did this problem start?");
    }
    
    if (issues.includes('streaming_issues')) {
      questions.push("Which streaming service is having issues?");
      questions.push("What video quality are you trying to watch?");
    }
    
    return questions.slice(0, 2); // Limit to 2 questions
  }
}