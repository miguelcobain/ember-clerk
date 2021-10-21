// uses Clerk service to kick off ClerkJS initialization
export function initialize(applicationInstance) {
  let clerkService = applicationInstance.lookup('service:clerk');
  clerkService.initClerk();
}

export default {
  initialize,
};
