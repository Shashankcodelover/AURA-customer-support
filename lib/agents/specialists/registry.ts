import { billingAgent } from './billingAgent';
import { technicalAgent } from './technicalAgent';
import { orderAgent } from './orderAgent';
import { accountAgent } from './accountAgent';
import { Specialist } from './types';

/**
 * The dispatch table is the only thing that makes this a "multi-agent
 * system" rather than one function with an if/else ladder: each entry is a
 * genuinely separate module (own file, own function, own focus logic) that
 * could be called directly, unit-tested in isolation, or swapped for an
 * independent LLM call/agent process without touching the others.
 */
export const specialistRegistry: Record<string, Specialist> = {
  Billing: billingAgent,
  Technical: technicalAgent,
  Order: orderAgent,
  Account: accountAgent,
};

export function getSpecialist(category: string): Specialist {
  return specialistRegistry[category] ?? specialistRegistry.Technical;
}
