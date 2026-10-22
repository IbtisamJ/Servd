import { Redirect } from 'expo-router';

/**
 * Temporary entry point so the Food Enterprise flow can be run on its own.
 * Once login is merged, the auth flow should send Food Enterprise accounts to
 * `/enterprise` and NGO accounts to the NGO dashboard instead.
 */
export default function Index() {
  return <Redirect href="/enterprise" />;
}
