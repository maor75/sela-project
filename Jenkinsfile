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
                - name: POSTGRES_USER
                  value: "mongo"
                - name: POSTGRES_PASSWORD
                  value: "mongo"
                - name: POSTGRES_DB
                  value: "mydb"
                - name: HOST
                  value: "localhost"
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
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('maven version') {
            steps {
                container('maven') {
                    sh 'mvn -version'
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
                        withDockerRegistry(credentialsId: '572e9b6d-3abc-4c15-ad0b-206d2db3ee7b') {
                            // Build and Push Maven Docker image
                            sh "docker build -t ${DOCKER_IMAGE}:react1 ./test1"
                            sh "docker build -t ${DOCKER_IMAGE}:backend ./fast_api"
                            sh "docker push ${DOCKER_IMAGE}:react1"
                            sh "docker push ${DOCKER_IMAGE}:backend"
                            
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
