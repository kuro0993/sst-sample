import * as sst from '@serverless-stack/resources';
import { Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';

export default class InfraStack extends sst.Stack {
  public readonly vpc: Vpc;
  public readonly securityGroup: SecurityGroup;
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    /*
     * Create VPC
     */
    this.vpc = new Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16',
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-1',
          subnetType: SubnetType.PUBLIC,
          reserved: false,
        },
        /*
         * {
         *   cidrMask: 24,
         *   name: 'public-2',
         *   subnetType: SubnetType.PUBLIC,
         *   reserved: false,
         * },
         */
        {
          cidrMask: 24,
          name: 'private-1',
          subnetType: SubnetType.PRIVATE,
          reserved: false,
        },
        /*
         * {
         *   cidrMask: 24,
         *   name: 'private-2',
         *   subnetType: SubnetType.PRIVATE,
         *   reserved: false,
         * },
         */
      ],
    });

    /*
     * Create Security Group
     */
    this.securityGroup = new SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      description: 'Allow SSH and HTTP Inbound',
      allowAllOutbound: true,
    });

    this.securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(22),
      'Allow SSH'
    );
    this.securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      'Allow HTTP Access'
    );

    /*
     * Create IAM?
     */

    /*
     * Output
     */
    this.addOutputs({
      VpcArn: this.vpc.vpcArn
    });
  }
}
