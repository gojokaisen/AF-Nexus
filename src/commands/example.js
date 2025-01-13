export default {
  config: {
    name: 'commandname',
   description: 'Command description',
   Author: 'Frank X Asta nexus',
   usage: '!commandname <args>',
   cooldown: 10,
   permissions: ['user', 'admin']
  },
  
  run: async ({ 
    api,           // Facebook chat API
    message,       // Incoming message object
    args,          // Command arguments
    config,        // Global bot configuration
    setReplyContext // Function to set conversation context
  }) => {
    // Main command execution logic like your code here 😎
  },
  
  onStart: ({ 
    api, 
    message, 
    args, 
    config,
    setReplyContext 
  }) => {
    // Optional: Actions to perform before run
  },
  
  onChat: ({ 
    api, 
    message, 
    config,
    setReplyContext 
  }) => {
    // Trigger without prefix 
  },
  
  onReply: ({ 
    api, 
    message, 
    config,
    replyData // Context from previous interaction
  }) => {
    // Handle follow-up interactions
  }
}