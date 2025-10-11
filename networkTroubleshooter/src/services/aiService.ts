export interface NetworkProblem {
  id: string;
  problem: string;
  solutions: string[];
  timestamp: Date;
}

export class AITroubleshooter {
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

  analyzeProblem(userInput: string): string[] {
    const input = userInput.toLowerCase();
    
    // Score each pattern based on keyword matches
    let bestMatch = { pattern: null as any, score: 0 };
    
    for (const pattern of this.problemPatterns) {
      let score = 0;
      
      // Check for exact phrase matches (higher score)
      for (const keyword of pattern.keywords) {
        if (input.includes(keyword.toLowerCase())) {
          // Longer phrases get higher scores
          score += keyword.split(' ').length * 2;
        }
      }
      
      // Check for individual word matches
      const inputWords = input.split(' ');
      for (const keyword of pattern.keywords) {
        const keywordWords = keyword.toLowerCase().split(' ');
        for (const word of keywordWords) {
          if (inputWords.includes(word)) {
            score += 1;
          }
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { pattern, score };
      }
    }
    
    // Return best matching solutions, or default if no good match
    if (bestMatch.pattern && bestMatch.score > 0) {
      return bestMatch.pattern.solutions;
    }
    
    // Smart default solutions based on common words
    if (input.includes('router') || input.includes('modem')) {
      return [
        '🔄 Restart your router and modem (unplug for 30 seconds)',
        '🔌 Check all cable connections are secure',
        '⚡ Make sure all lights on router/modem are normal',
        '📞 Contact ISP if lights indicate problems'
      ];
    }
    
    if (input.includes('password') || input.includes('login')) {
      return [
        '🔑 Check WiFi password (usually on router sticker)',
        '👀 Make sure you\'re connecting to the right network',
        '🔄 Restart router and try reconnecting',
        '⚙️ Reset router to factory settings if needed'
      ];
    }
    
    // Generic fallback solutions
    return [
      '🔄 Restart your router and modem (unplug for 30 seconds)',
      '📶 Check if other devices can connect to internet', 
      '🔌 Verify all cables are properly connected',
      '📞 Contact technical support for further assistance'
    ];
  }
}