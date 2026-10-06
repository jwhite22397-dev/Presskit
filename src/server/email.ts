export interface TransactionalEmail {
  to: string;
  template: "welcome" | "upgrade_succeeded" | "subscription_issue";
  variables: Record<string, string>;
}

export async function sendTransactionalEmail(message: TransactionalEmail) {
  console.info(JSON.stringify({ source: "presskit.email", ...message, at: new Date().toISOString() }));
}
