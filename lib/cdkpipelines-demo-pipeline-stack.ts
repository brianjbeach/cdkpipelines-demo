import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";
import { CdkpipelinesDemoStage } from './cdkpipelines-demo-stage';

/**
 * The stack that defines the application pipeline
 */
export class CdkpipelinesDemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'MyServicePipeline',
      
      // Required for cross account access to S3
      crossAccountKeys: true,
      
       // How it will be built and synthesized
       synth: new ShellStep('Synth', {
         // Where the source can be found
         input: CodePipelineSource.gitHub('brianjbeach/cdkpipelines-demo', 'master'),
         
         // Install dependencies, build and run cdk synth
         commands: [
           'npm ci',
           'npm run build',
           'npx cdk synth'
         ],
       }),
    });

    pipeline.addStage(new CdkpipelinesDemoStage(this, 'PreProd', {
      env: { account: '968520978119', region: 'us-east-2' }
    }));
    
    pipeline.addStage(new CdkpipelinesDemoStage(this, 'Prod', {
      env: { account: '968520978119', region: 'us-west-2' }
    }));
    
  }
}