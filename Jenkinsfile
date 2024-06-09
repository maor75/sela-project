pipeline {
    agent {
        kubernetes {
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: maven
                image: maven:alpine
                command:
                - cat
                tty: true
              - name: python
                image: python:3.9-alpine
                command:
                - cat
                tty: true
              - name: ez-docker-helm-build
                image: ezezeasy/ez-docker-helm-build:1.41
                imagePullPolicy: Always
                securityContext:
                  privileged: true
            '''
        }
    }
"""
        }
    }
    environment {
        DOCKER_IMAGE = "edmonp173/project_app"
    }


    stages {
        stage('Checkout Code') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: 'https://github.com/learn11/sela-project.git']]])
            }
        }

        stage('Wait for MongoDB') {
            steps {
                container('python') {
                    script {
                        sh 'while ! nc -z mongodb.default.svc.cluster.local 27017; do echo "Waiting for MongoDB..."; sleep 1; done; echo "MongoDB is running!"'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                container('python') {
                    script {
                        sh 'python3 config-test.py'
                    }
                }
            }
        }

        stage('Build and Push Docker Images') {
            when {
                branch 'main'
            }
            steps {
                container('ez-docker-helm-build') {
                    script {
                        withDockerRegistry(credentialsId: 'dockerhub') {
                            // Build and Push Maven Docker image
                            sh "docker build -t ${DOCKER_IMAGE}:react1 ./test1"
                            sh "docker push ${DOCKER_IMAGE}:react1"

                            // Build and Push FastAPI Docker image
                            sh "docker build -t ${DOCKER_IMAGE}:backend ./fast_api"
                            sh "docker push ${DOCKER_IMAGE}:backend"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            emailext(
                to: 'edmonp173@gmail.com',
                subject: "Jenkins Build: ${currentBuild.fullDisplayName}",
                body: """<p>Build ${currentBuild.fullDisplayName} completed with status ${currentBuild.result}.</p>
                         <p>Check console output at ${env.BUILD_URL} to view the results.</p>"""
            )
        }
    }
}
