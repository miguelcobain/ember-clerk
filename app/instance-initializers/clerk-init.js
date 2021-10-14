// uses Clerk service to initialize ClerkJS client
export function initialize(applicationInstance) {
  let clerkService = applicationInstance.lookup('service:clerk');
  clerkService.initClerk();
}

export default {
  initialize,
};
