# Build and push helm image
### Add nexus repo 
helm repo add seps-helm https://nexus.seps.gob.ec/repository/helm-snapshots/ --username <myUser > --password <myPassword>

### Update dependencies
helm dependency update ./ci/helm
Ó
helm dep update

### Package helm chart 
helm package ./ci/helm

### install plugin
helm plugin install --version master https://gitlab.seps.gob.ec/utils/helm/helm-nexus-push.git

### Upload artefact
helm nexus-push . artifactName-version.tgz  -u <myUser > -p <myPassword>
Ó
helm nexus-push seps-helm artifactName-version.tgz  -u <myUser > -p <myPassword>  
Ó
helm nexus-push . ./ci/helm  -u myUser -p myPassword
Ó
helm nexus-push  .  . -u <myUser>  -p <myPassword>
Ó
helm nexus-push seps-helm ./ci/helm  -u <myUser>  -p <myPassword>
