// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TActivity } from "../../types/activity.type";
import { TOrchestrator } from "../../types/orchestrator.type";
import { Task } from "../task";

export abstract class OrchestrationContext {
  /**
   * The instance ID of the currently executing orchestration.
   *
   * The instance ID is generated and fixed when the orchestrator function is scheduled. It can be either auto-generated, in which
   * case it is a GUID, or it can be user-specified with any format.
   *
   * @returns {string} The instance ID of the currently executing orchestration.
   */
  abstract get instanceId(): string;

  /**
   * Get the current date/time as UTC
   *
   * @returns {Date} The current timestamp in a way that is safe for use by orchestrator functions
   */
  abstract get currentUtcDateTime(): Date;

  /**
   * Get the value indicating whether the orchestrator is replaying from history.
   *
   * This property is useful when there is logic that needs to run only when
   * the orchestrator function is _not_ replaying. For example, certain
   * types of application logging may become too noisy when duplicated as
   * part of orchestrator function replay. The orchestrator code could check
   * to see whether the function is being replayed and then issue the log
   * statements when this value is `false`.
   *
   * @returns {boolean} `true` if the orchestrator function is replaying from history; otherwise, `false`.
   */
  abstract get isReplaying(): boolean;

  /**
   * Create a timer task that will fire at a specified time.
   *
   * @param {Date | number} fireAt The time at which the timer should fire.
   * @returns {Task} A Durable Timer task that schedules the timer to wake up the orchestrator
   */
  abstract createTimer(fireAt: Date | number): Task<any>;

  /**
   * Schedule an activity for execution.
   *
   * @param {Orchestrator} orchestrator The sub-orchestrator function to call.
   * @param {TInput} input The JSON-serializable input value for the sub-orchestrator function.
   * @param {string} instanceId The ID to use for the sub-orchestration instance. If not provided, a new GUID will be used.
   *
   * @returns {Task<TOutput>} A Durable Task that completes when the sub-orchestrator function completes.
   */
  abstract callActivity<TInput, TOutput>(activity: TActivity<TInput, TOutput> | string, input?: TInput): Task<TOutput>;

  /**
   * Schedule sub-orchestrator function for execution.
   *
   * @param orchestrator A reference to the orchestrator function call
   * @param input The JSON-serializable input value for the orchestrator function.
   * @param instanceId A unique ID to use for the sub-orchestration instance. If not provided, a new GUID will be used.
   *
   * @returns {Task<TOutput>} A Durable Task that completes when the sub-orchestrator function completes.
   */
  abstract callSubOrchestrator<TInput, TOutput>(
    orchestrator: TOrchestrator | string,
    input?: TInput,
    instanceId?: string,
  ): Task<TOutput>;

  /**
   * Wait for an event to be raised with the name "name"
   *
   * @param name The name of the event to wait for
   * @returns {Task} A Durable Task that completes when the event is received
   */
  abstract waitForExternalEvent(name: string): Task<any>;

  /**
   * Continue the orchestration execution as a new instance
   *
   * @param newInput {any} The new input to use for the new orchestration instance.
   * @param saveEvents {boolean} A flag indicating whether to add any unprocessed external events in the new orchestration history.
   */
  abstract continueAsNew(newInput: any, saveEvents: boolean): void;

  /**
   * Sets the custom status
   *
   * @param status {string} The new custom status
   */
  abstract setCustomStatus(status: string): void;
}
