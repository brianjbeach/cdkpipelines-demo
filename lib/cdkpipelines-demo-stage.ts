import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { CdkpipelinesDemoStack } from './cdkpipelines-demo-stack';

/**
 * Deployable unit of web service app
 */
export class CdkpipelinesDemoStage extends Stage {
  public readonly urlOutput: CfnOutput;
  public readonly service: CdkpipelinesDemoStack;
  
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    this.service = new CdkpipelinesDemoStack(this, 'WebService');
    
    // Expose CdkpipelinesDemoStack's output one level higher
    this.urlOutput = this.service.urlOutput;
  }
}