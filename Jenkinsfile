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
                - name: MONGO_USER
                  value: "mongo"
                - name: MONGO_PASSWORD
                  value: "mongo"
                - name: MONGO_DB
                  value: "mydb"
                - name: HOST
                  value: "localhost"
              - name: ez-docker-helm-build
                image: ezezeasy/ez-docker-helm-build:1.41
                imagePullPolicy: Always
                securityContext:
                  privileged: true
              - name: jnlp
                image: jenkins/inbound-agent:3248.v65ecb_254c298-2
                env:
                - name: JENKINS_SECRET
                  value: "********"
                - name: JENKINS_TUNNEL
                  value: "jenkins-agent.default.svc.cluster.local:50000"
                - name: JENKINS_AGENT_NAME
                  value: "main-ci-main-12-5s1gr-3ps2c-hq0d3"
                - name: REMOTING_OPTS
                  value: "-noReconnectAfter 1d"
                - name: JENKINS_NAME
                  value: "main-ci-main-12-5s1gr-3ps2c-hq0d3"
                - name: JENKINS_AGENT_WORKDIR
                  value: "/home/jenkins/agent"
                - name: JENKINS_URL
                  value: "http://jenkins.default.svc.cluster.local:8080/"
                volumeMounts:
                - mountPath: "/home/jenkins/agent"
                  name: "workspace-volume"
                  readOnly: false
              restartPolicy: Never
              volumes:
              - emptyDir:
                  medium: ""
                name: "workspace-volume"
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
                            sh "docker build -t ${DOCKER_IMAGE}:${env.BUILD_NUMBER} ./test1"
                            sh "docker build -t ${DOCKER_IMAGE}:react ./test1"
                            sh "docker push ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                            sh "docker push ${DOCKER_IMAGE}:react1"

                            // Build and Push FastAPI Docker image
                            sh "docker build -t ${DOCKER_IMAGE}:${env.BUILD_NUMBER} ./fast_api"
                            sh "docker build -t ${DOCKER_IMAGE}:fastapi ./fast_api"
                            sh "docker push ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                            sh "docker push ${DOCKER_IMAGE}:Backend"
                        }
                    }
                }
            }
        }

        stage('merge request') {
            when {
                not {
                    branch 'main'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: '8bbebc96-214c-4961-a35b-8c5448592373', usernameVariable: 'GITHUB_USER', passwordVariable: 'GITHUB_TOKEN')]) {
                        sh """
                        curl -X POST -u ${GITHUB_USER}:${GITHUB_TOKEN} -d '{
                            "title": "Merge feature to main",
                            "head": "feature",
                            "base": "main"
                        }' https://api.github.com/repos/learn11/sela-project/pulls
                        """
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
