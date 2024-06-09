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

    environment {
        DOCKER_IMAGE = "edmonp173/project_app"
        MONGO_HOST = "mongodb.default.svc.cluster.local" // Update this with your MongoDB service DNS
        MONGO_PORT = "27017"
        MONGO_INITDB_ROOT_USERNAME = "root"
        MONGO_INITDB_ROOT_PASSWORD = "edmon"
        MONGO_INITDB_DATABASE = "mydb"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Wait for MongoDB') {
            steps {
                container('maven') {
                    script {
                        def maxTries = 30
                        def waitTime = 10
                        def mongoRunning = false
                        for (int i = 0; i < maxTries; i++) {
                            mongoRunning = sh(script: "nc -z ${env.MONGO_HOST} ${env.MONGO_PORT}", returnStatus: true) == 0
                            if (mongoRunning) {
                                echo 'MongoDB is running!'
                                break
                            }
                            echo 'Waiting for MongoDB to start...'
                            sleep waitTime
                        }
                        if (!mongoRunning) {
                            error 'MongoDB did not start in time'
                        }
                    }
                }
            }
        }

        stage('maven version') {
            steps {
                container('maven') {
                    sh 'mvn -version'
                }
            }
        }

        stage('Run Tests') {
            steps {
                container('maven') {
                    script {
                        // Check if pom.xml exists in the workspace
                        def pomExists = fileExists 'pom.xml'
                        if (!pomExists) {
                            error 'pom.xml file not found in the workspace'
                        }
                    }
                    sh 'mvn test'
                }
            }
        }

        stage('Run Python Test Script') {
            steps {
                container('python') {
                    sh '''
                    python config-test.py > output.log
                    if grep -q "Failed" output.log; then
                        echo "Test failed. Check logs for details."
                        exit 1
                    else
                        echo "All tests passed."
                    fi
                    '''
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
            echo 'Pipeline post'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            emailext body: 'The build failed. Please check the build logs for details.',
                     subject: "Build failed: ${env.BUILD_NUMBER}",
                     to: 'edmonp173@gmail.com'
        }
    }
}
