/* eslint-disable @typescript-eslint/no-unused-vars */

export interface NetworkProblem {
  id: string;
  problem: string;
  solutions: string[];
  confidence: number;
  // removed detailed AI reasoning text per user request
  aiReasoning?: string;
  followUpQuestions?: string[];
  timestamp: Date;
}

export interface AIAnalysis {
  solutions: string[];
  // optional reasoning (kept for internal use but not displayed by UI)
  reasoning?: string;
  confidence: number;
  followUpQuestions?: string[];
  detectedIssues: string[];
}

export class AITroubleshooter {
  private _knowledgeBase = {
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

  private _problemPatterns = [
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

  // Main AI analysis method that thinks and reasons (async)
  async analyzeIntelligently(userInput: string): Promise<AIAnalysis> {
    // Strict API-only flow: call server proxy /api/ai which returns structured JSON
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem: userInput })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI API error: ${res.status} ${res.statusText} - ${text}`);
    }

    const parsed = await res.json();

    const result: AIAnalysis = {
      solutions: Array.isArray(parsed.solutions) ? parsed.solutions : [],
      reasoning: parsed.reasoning || parsed.explanation || undefined,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
      followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : undefined,
      detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues : []
    };

    return result;
  }

  // Legacy method for backward compatibility (returns a promise)
  async analyzeProblem(userInput: string): Promise<string[]> {
    return (await this.analyzeIntelligently(userInput)).solutions;
  }

  // Optional OpenAI integration (client-side). Set VITE_OPENAI_KEY in your .env to enable.
  private async callOpenAIIfAvailable(userInput: string): Promise<AIAnalysis | null> {
    try {
      // First try the server-side proxy (more secure). The server should expose POST /api/ai { problem }
      try {
        const proxyRes = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problem: userInput })
        });

        if (proxyRes.ok) {
          const parsed = await proxyRes.json();
          const result: AIAnalysis = {
            solutions: Array.isArray(parsed.solutions) ? parsed.solutions : [],
            reasoning: parsed.reasoning || parsed.explanation || '',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
            followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
            detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues : []
          };
          return result;
        }
      } catch (proxyErr) {
        // proxy might not be running; fallthrough to client-side attempt
        console.info('Server proxy /api/ai not available or failed, will try client-side OpenAI if key present', proxyErr);
      }

      // As a fallback, if the developer provided a client-side key (not recommended for production), try that.
      const env: any = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {});
      const key = env?.VITE_OPENAI_KEY || env?.OPENAI_API_KEY || env?.REACT_APP_OPENAI_KEY;
      if (!key) return null;

      const systemPrompt = `You are a helpful network troubleshooting assistant. When given a user's problem, return a JSON object with fields: solutions (array of short, practical step-by-step actions), reasoning (short plain-text explanation), confidence (number 0-100), followUpQuestions (array of up to 3 questions), detectedIssues (array of short tags). Only return valid JSON. Keep steps practical, numbered or short sentences.`;

      const userPrompt = `Problem: "${userInput}"\n\nRespond only with JSON matching the schema: {"solutions": [..], "reasoning": "..", "confidence": <number>, "followUpQuestions": [..], "detectedIssues": [..] }`;

      const body = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.2
      };

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        console.warn('OpenAI response not ok', await res.text());
        return null;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) return null;

      // Some models return code fences; try to extract JSON
      const jsonTextMatch = content.match(/\{[\s\S]*\}/);
      const jsonText = jsonTextMatch ? jsonTextMatch[0] : content;
      const parsed = JSON.parse(jsonText);

      // Basic normalization/validation
      const result: AIAnalysis = {
        solutions: Array.isArray(parsed.solutions) ? parsed.solutions : [],
        reasoning: parsed.reasoning || parsed.explanation || '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [],
        detectedIssues: Array.isArray(parsed.detectedIssues) ? parsed.detectedIssues : []
      };

      return result;
    } catch (err) {
      console.warn('OpenAI integration error:', err);
      return null;
    }
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
            `1) 🔄 Power-cycle your modem and router: unplug both devices for 30 seconds, then plug modem back in, wait 60 seconds, then plug router back in.`,
            `2) 📊 Run an internet speed test (speedtest.net) on the affected device and compare to your plan.`,
            `3) 📱 Close apps or downloads consuming bandwidth (torrent clients, cloud backups, streaming).`,
            device === 'mobile' ? 
              `4) 📶 Move closer to router or try the same test on another device to see if issue is device-specific.` :
              `4) 🔌 Connect the device with an Ethernet cable and test again to isolate WiFi vs ISP issues.`
          );
          break;
          
        case 'connection_failure':
          solutions.push(
            `1) � Verify the exact WiFi network name (SSID) and re-enter the password carefully (case-sensitive).`,
            `2) � On the device, check WiFi scan list: can you SEE the network? If not, try restarting the router.`,
            `3) 🔄 Forget the network on the device and re-add it (Settings → WiFi → Forget → Reconnect).`,
            device === 'mobile' ?
              `4) ✈️ Toggle Airplane Mode for 10s then reconnect (this refreshes radios).` :
              `4) 💻 Update or reinstall network drivers (Device Manager → Network adapters → Update driver).`
          );
          break;
          
        case 'streaming_issues':
          const streamingSolution = currentTime > 18 || currentTime < 9 ?
            '1) ⏰ Peak hours likely — lower video quality to 480p or 720p.' :
            '1) 🚀 Use Ethernet or ensure strong WiFi signal (one meter away from router for testing).';
          solutions.push(
            streamingSolution,
            `2) 📺 Restart the streaming app and device, sign out and back into the service.`,
            `3) ⏸️ Pause other devices or downloads and rerun the stream test.`
          );
          break;
          
        case 'video_call_issues':
          solutions.push(
            `1) 💻 Switch to Ethernet and close background apps; if not possible, move closer to router.`,
            `2) 🎥 Lower call resolution or disable your video to improve audio stability.`,
            `3) ⚙️ Update or reinstall the calling app, and test in a different meeting to isolate service issues.`
          );
          break;
          
        default:
          solutions.push(
            `1) 🔧 Smart Diagnostic: I analyzed your input "${originalInput}" and recommend these step-by-step checks.`,
            `2) 📋 Check router lights (power, internet/online, WAN/DSL) and confirm cables are firmly connected.`,
            `3) 📞 If steps fail, collect router model and ISP contact info and contact support.`
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

  private generateFollowUpQuestions(issues: string[], _analysis: any): string[] {
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