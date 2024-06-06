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
              - name: mongodb
                image: mongo:latest
                env:
                - name: MONGO_INITDB_ROOT_USERNAME
                  value: "root"
                - name: MONGO_INITDB_ROOT_PASSWORD
                  value: "edmon"
                - name: MONGO_INITDB_DATABASE
                  value: "mydb"
              - name: python
                image: python:3.9-slim
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
        DOCKER_IMAGE = "edmonp173/project_app:backend"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                container('ez-docker-helm-build') {
                    script {
                        // Build FastAPI Docker image
                        sh "docker build -t ${DOCKER_IMAGE} ./fast_api"
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                container('ez-docker-helm-build') {
                    script {
                        // Run the test script inside the Docker container
                        sh "docker run --rm -v \$(pwd)/fast_api:/app -w /app ${DOCKER_IMAGE} python config-test.py"
                    }
                }
            }
        }

        stage('Push Docker Images') {
            when {
                branch 'main'
            }
            steps {
                container('ez-docker-helm-build') {
                    script {
                        withDockerRegistry(credentialsId: 'dockerhub') {
                            // Push FastAPI Docker image
                            sh "docker push ${DOCKER_IMAGE}"
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
