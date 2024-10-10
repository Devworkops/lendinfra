import mongoose from "mongoose";

export interface IRuleAction {
  // Can pass record id set, or it will update eligible records.
  setup(recordIds?: string[]): Promise<void>
  // Implement it for update action
  onSuccess(record: any, action: any, event: any): Promise<void>
  // Implement it for failure action
  onFailure(record: any, action: any, event: any): Promise<void>
  // To evaluate the action for given rule set or for all rule set
  execute(): Promise<void>
}
