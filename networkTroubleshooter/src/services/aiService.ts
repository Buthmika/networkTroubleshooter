export interface NetworkProblem {
  id: string;
  problem: string;
  solutions: string[];
  timestamp: Date;
}

export class AITroubleshooter {
  private solutions = {
    'slow internet': [
      '🔄 Restart your router and modem (unplug for 30 seconds)',
      '📱 Close apps using internet in background', 
      '📍 Move closer to your WiFi router',
      '🔧 Update your network drivers'
    ],
    'no wifi': [
      '📶 Check if WiFi is turned on your device',
      '🔄 Restart your phone/computer',
      '🔐 Forget WiFi and connect again with password',
      '⚡ Check if router has power (lights on)'
    ],
    'cant connect': [
      '🔑 Double-check your WiFi password',
      '🔄 Restart your router (unplug 30 seconds)',
      '👀 Make sure WiFi network name is visible',
      '⚙️ Reset network settings on your device'
    ],
    'no internet': [
      '🔌 Check all cable connections are tight',
      '🔄 Restart your modem (the box from internet company)',
      '📞 Call your internet company (maybe service down)',
      '🌐 Check if internet is down in your area online'
    ]
  };

  analyzeProblem(userInput: string): string[] {
    const input = userInput.toLowerCase();
    
    for (const [key, solutions] of Object.entries(this.solutions)) {
      if (input.includes(key)) {
        return solutions;
      }
    }
    
    // Default solutions if no match
    return [
      '🔄 Try restarting your router (unplug 30 seconds)',
      '🔌 Check all cable connections',
      '📞 Contact technical support if problem continues'
    ];
  }
}