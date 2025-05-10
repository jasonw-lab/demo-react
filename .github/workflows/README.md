# GitHub Workflow for Automatic Deployment

This directory contains GitHub Actions workflow files that automate the deployment process when code is pushed to the repository.

## deploy.yml

The `deploy.yml` workflow automatically deploys changes to a VPS when code is pushed to the repository. It detects which directories have changes and only deploys the affected applications.

### How It Works

1. When code is pushed to the main branch, the workflow is triggered.
2. It detects which directories have changes (BookingHotel, PhotoGallary, Weather, mealplanner).
3. It connects to the VPS via SSH and runs the build.sh script with the appropriate parameters based on which directories have changes.

### Required GitHub Secrets

To use this workflow, you need to set up the following secrets in your GitHub repository:

1. **VPS_HOST**: The hostname or IP address of your VPS.
2. **VPS_USERNAME**: The SSH username for your VPS.
3. **VPS_SSH_KEY**: The private SSH key for authentication.
4. **VPS_PORT**: The SSH port (usually 22).
5. **PROJECT_PATH**: The full path to the project directory on your VPS.

### Setting Up GitHub Secrets

1. Go to your GitHub repository.
2. Click on "Settings" tab.
3. In the left sidebar, click on "Secrets and variables" > "Actions".
4. Click on "New repository secret".
5. Add each of the required secrets:

   - Name: `VPS_HOST`
     Value: Your VPS hostname or IP address (e.g., `123.456.789.0`)

   - Name: `VPS_USERNAME`
     Value: Your SSH username (e.g., `ubuntu`)

   - Name: `VPS_SSH_KEY`
     Value: Your private SSH key (the content of your `id_rsa` file)

   - Name: `VPS_PORT`
     Value: Your SSH port (usually `22`)

   - Name: `PROJECT_PATH`
     Value: The full path to the project directory on your VPS (e.g., `/home/ubuntu/demo-list/vue`)

### Testing the Workflow

After setting up the secrets, the workflow will automatically run when you push changes to the main branch. You can monitor the workflow execution in the "Actions" tab of your GitHub repository.