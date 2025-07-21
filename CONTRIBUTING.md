# Contributing to {{ PROJECT_NAME }}

First off, thanks for taking the time to contribute! :tada:

## Contributing Guidelines

1. Follow the 'Getting Started' instructions in the README  

2. **Create a new branch for your changes**:
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes locally**:
   * Follow the setup instructions under Getting Started  in the README to set up the dev environment 

4. 4. **IMPORTANT: check to see if your changes actually build**: 
```bash 
npm run build 
``` 
* if there are any build errors, they'll be listed in the terminal, please fix them. If everything builds fine, you're good to go (warnings are fine, but errors must be addressed)

5. **Commit your changes**:
* Make sure to add/commit ONLY the files that actually relate to the PR: do NOT do `git add .`, as there are several files that are different from prod so that localhost works properly (like firebaseAdmin, firebaseConfig, everything in the Prisma folder, etc.) so you don't want to commit these to prod 
```bash
git add [files_you_modified]
git commit -m "Description of your changes"
```

6. **Push your branch to your fork**:
```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request (PR)**:
   * Go to the original repository's GitHub page.
   * Click the "Pull Request" tab.
   * Select your branch and submit the PR.

8. **Wait for Review**:
   * A maintainer will review your PR.
   * Make any requested changes and update the PR.
