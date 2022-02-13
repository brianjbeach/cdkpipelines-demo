import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CodePipeline, CodePipelineSource, ShellStep, ShellScriptAction, ManualApprovalStep, StackSteps, ConfirmPermissionsBroadening} from "@aws-cdk/pipelines";
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

    const preprod = new CdkpipelinesDemoStage(this, 'PreProd', {
        env: { account: '968520978119', region: 'us-east-2' }
    });
    
    const preprodStage = pipeline.addStage(preprod, {
        pre: [
            new ConfirmPermissionsBroadening('Broadening Permission Check', { stage: preprod })
        ],
        post: [
            new ShellStep('TestService', {
                commands: [
                  // Use 'curl' to GET the given URL and fail if it returns an error
                  'curl -Ssf $ENDPOINT_URL',
                ],
                envFromCfnOutputs: {
                  // Get the stack Output from the Stage and make it available in
                  // the shell script as $ENDPOINT_URL.
                  ENDPOINT_URL: preprod.urlOutput,
                },
            }),
        
        ],
    });
    
    
    const prod = new CdkpipelinesDemoStage(this, 'Prod', {
        env: { account: '968520978119', region: 'us-west-2' }
    });
    
    const prodStage = pipeline.addStage(prod,{

        stackSteps: [{
            stack: prod.service,
            changeSet: [
                new ManualApprovalStep('PromoteToProd', { 
                    comment: "Do you want to promote this build to production?"
                }),
            ]
        }]
    });
    
  }
}