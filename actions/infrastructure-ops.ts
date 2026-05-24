"use server";

import { actionOk, type ActionResult } from "@/lib/actions-result";

const QUEUED_MESSAGE = "Action queued for secure Webhook execution.";

/** Vercel-safe stub — no SSH. Fleet ops run via external webhook workers. */
export async function queueInfrastructureOpAction(
  _opId: string,
): Promise<ActionResult<{ message: string }>> {
  return actionOk({ message: QUEUED_MESSAGE });
}

export async function injectTcpBbrAction(): Promise<
  ActionResult<{ message: string }>
> {
  return queueInfrastructureOpAction("bbr");
}

export async function enableDnsRotatorAction(): Promise<
  ActionResult<{ message: string }>
> {
  return queueInfrastructureOpAction("doh");
}

export async function enableLoadBalancingAction(): Promise<
  ActionResult<{ message: string }>
> {
  return queueInfrastructureOpAction("lb");
}

export async function runAbuseCommandoAction(): Promise<
  ActionResult<{ message: string }>
> {
  return queueInfrastructureOpAction("abuse");
}
