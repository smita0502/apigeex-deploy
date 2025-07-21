pipeline {
    agent any
    tools {
        maven 'Maven'
        nodejs 'Nodejs'
    }
    stages {
        stage('Clean') {
            steps {
                dir('edge') {
                    sh "mvn clean"
                }
            }
        }

        stage('Build proxy bundle') {
            steps {
                dir('edge') {

                  sh "mvn package -Papigeex-apiproxy"


                    }
                }
            }

                    stage('Static Code Analysis, Unit Test and Coverage') {

                        steps {
                            dir('edge') {
                                sh "mvn test -Pproxy-unit-test "
                                sh "npm install"
                                sh "node node_modules/istanbul/lib/cli.js cover " +
                                        "--dir target/unit-test-coverage " +
                                        "node_modules/mocha/bin/_mocha test/unit"
                                echo "publish html report"
                                publishHTML(target: [
                                        allowMissing         : false,
                                        alwaysLinkToLastBuild: false,
                                        keepAll              : true,
                                        reportDir            : 'target/unit-test-coverage/lcov-report',
                                        reportFiles          : 'index.html',
                                        reportName           : 'Code Coverage HTML Report'
                                ])
                            }
                        }
                    }

        stage('Linting') {
             steps {
                 dir("edge") {
                 sh "npm install -g apigeelint"
                 sh "apigeelint -s apiproxy -f html.js > target/unit-test-coverage/apigeelint.html"
                 echo "publish html report"
                 publishHTML(target: [
                                        allowMissing         : false,
                                        alwaysLinkToLastBuild: false,
                                        keepAll              : true,
                                        reportDir            : 'target/unit-test-coverage',
                                        reportFiles          : 'apigeelint.html',
                                        reportName           : 'Linting HTML Report'
                 ])
                 }
             }
        }


        stage('pre-deploy-prep') {
            steps {
                dir('edge') {
                  withCredentials([file(credentialsId: params.org, variable: 'serviceAccount')]) {
                       sh "mvn -X apigee-config:targetservers -Papigeex-apiproxy -Dorg=${params.org} -Denv=${params.env} -Dfile=${serviceAccount} -Dapigee.config.options=update"
                  }
                }
            }
        }


        stage('Deploy proxy bundle') {
            steps {
                dir('edge') {
                    withCredentials([file(credentialsId: params.org, variable: 'serviceAccount')]) {

                    sh "mvn apigee-enterprise:deploy -Papigeex-apiproxy -Dorg=${params.org} -Denv=${params.env} -Dfile=${serviceAccount}"
                    }

                }

            }
        }


        stage('post-deploy') {

             steps {
                 dir('edge') {

                   withCredentials([file(credentialsId: params.org, variable: 'serviceAccount')]) {
                   script {
                       if (fileExists('resources/edge/org/apiProducts.json')) {

                               echo "load api product for integration init"
                               sh "mvn -X apigee-config:apiproducts -Papigeex-apiproxy -Dorg=${params.org} -Denv=${params.env} -Dfile=${serviceAccount} -Dapigee.config.options=update"

                       }
                       if (fileExists('resources/edge/org/developers.json')) {

                                echo "load api developer for integration init"
                                sh "mvn -X apigee-config:developers -Papigeex-apiproxy -Dorg=${params.org} -Denv=${params.env} -Dfile=${serviceAccount} -Dapigee.config.options=update"

                       }
                       if (fileExists('resources/edge/org/developerApps.json')) {

                                echo "load api developer app for integration init"
                                sh "mvn -X apigee-config:apps -Papigeex-apiproxy -Dorg=${params.org} -Denv=${params.env} -Dfile=${serviceAccount} -Dapigee.config.options=update"
                                echo "export app key for integration init"
                                sh "mvn -X apigee-config:exportAppKeys -Papigeex-apiproxy -Dorg=${params.org} -Denv=${params.env} -Dfile=${serviceAccount} -Dapigee.config.options=update"
                       }
                       }
                   }
                 }

             }
        }

        stage('upload-artifact') {

            steps {

                withMaven(maven: 'Maven',
                        globalMavenSettingsConfig: 'cicd-settings-file') {
                    sh "mvn deploy"
                }


            }
        }

    }
}