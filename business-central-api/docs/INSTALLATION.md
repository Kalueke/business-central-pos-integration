# Installation Guide

## Prerequisites

### System Requirements
- **Microsoft Business Central**: Version 22.0 or later
- **AL Development Environment**: Visual Studio Code with AL extension
- **POS System**: Accessible API endpoints with authentication
- **Network Access**: Connectivity between Business Central and POS system

### Development Environment Setup
1. **Install Visual Studio Code**
   ```bash
   # Download from https://code.visualstudio.com/
   ```

2. **Install AL Extension**
   ```bash
   # In VS Code, go to Extensions (Ctrl+Shift+X)
   # Search for "AL Language" and install
   ```

3. **Install Business Central Docker Container** (for development)
   ```bash
   # Pull BC container
   docker pull mcr.microsoft.com/businesscentral/onprem:22.0.0.0-ltsc2019
   
   # Run BC container
   docker run -e accept_eula=y -e username=admin -e password=P@ssw0rd -p 7049:7049 -p 7080:7080 mcr.microsoft.com/businesscentral/onprem:22.0.0.0-ltsc2019
   ```

## Installation Steps

### Step 1: Download the Extension
```bash
# Clone or download the extension files
git clone <repository-url>
cd business-central-pos-integration/business-central-api
```

### Step 2: Configure the Extension
1. **Open the project in VS Code**
   ```bash
   code .
   ```

2. **Update app.json** (if needed)
   ```json
   {
     "id": "your-unique-guid-here",
     "name": "POS Integration",
     "publisher": "Your Company Name",
     "version": "1.0.0.0"
   }
   ```

### Step 3: Publish to Business Central

#### Option A: Development Environment
```bash
# Publish to local BC container
al publish --server http://localhost:7049/BC220/ODataV4 --environmentType OnPrem

# Or use VS Code command palette
# Ctrl+Shift+P -> "AL: Publish"
```

#### Option B: Production Environment
```bash
# Publish to production BC
al publish --server https://your-bc-server.com/BC220/ODataV4 --environmentType Cloud
```

### Step 4: Install in Business Central
1. **Open Business Central**
2. **Navigate to Extensions**
   - Search → "Extensions"
   - Find "POS Integration"
   - Click "Install"

### Step 5: Initial Configuration
1. **Open POS Integration Setup**
   - Search → "POS Integration"
   - Click on "BC POS Integration"

2. **Configure Basic Settings**
   ```
   Integration Enabled: Yes
   API Base URL: http://your-pos-server:3001
   API Key: your-api-key-here
   Default Customer No.: C00001
   Default Location Code: MAIN
   ```

## Post-Installation Verification

### Test Connection
1. **In BC POS Integration page**
2. **Click "Test Connection"**
3. **Verify success message**

### Check Permissions
Ensure users have proper permissions:
- **POS Integration Setup**: Read/Write
- **POS Sync Log**: Read
- **Sales Header**: Read/Write
- **Sales Line**: Read/Write

### Verify Logging
1. **Open "POS Sync Log"**
2. **Check for initial log entries**
3. **Verify connection test appears**

## Troubleshooting Installation

### Common Issues

#### Extension Won't Publish
```bash
# Check AL compiler version
al --version

# Verify app.json syntax
# Ensure all .al files are valid
```

#### Connection Test Fails
- Verify POS API is running
- Check network connectivity
- Validate API key and URL
- Review firewall settings

#### Permission Errors
```sql
-- Grant permissions to users
INSERT INTO PermissionSet (RoleID, ObjectType, ObjectID, ReadPermission, InsertPermission, ModifyPermission, DeletePermission, ExecutePermission)
VALUES ('POS_INTEGRATION', 0, 50100, 1, 1, 1, 1, 1);
```

### Log Files
Check Business Central logs:
- **Application Log**: `C:\ProgramData\Microsoft\Microsoft Dynamics 365 Business Central\220\Log`
- **Event Viewer**: Windows Logs → Application

## Development Setup

### Local Development
```bash
# Create launch.json for debugging
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Business Central",
      "type": "al",
      "request": "launch",
      "environmentType": "OnPrem",
      "server": "http://localhost:7049/BC220/ODataV4",
      "serverInstance": "BC220",
      "authentication": "Windows",
      "startupObjectId": 50100,
      "startupObjectType": "Page"
    }
  ]
}
```

### Testing Environment
```bash
# Create test container
docker run -e accept_eula=y -e username=admin -e password=P@ssw0rd -p 7049:7049 -p 7080:7080 mcr.microsoft.com/businesscentral/onprem:22.0.0.0-ltsc2019

# Publish to test environment
al publish --server http://localhost:7049/BC220/ODataV4 --environmentType OnPrem
```

## Uninstallation

### Remove Extension
1. **In Business Central**
   - Extensions → POS Integration → Uninstall

2. **Clean up data** (optional)
   ```sql
   DELETE FROM "POS Integration Setup";
   DELETE FROM "POS Sync Log";
   ```

### Remove Files
```bash
# Remove extension files
rm -rf business-central-api/
```

## Support

For installation issues:
1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Review Business Central logs
3. Contact system administrator
4. Refer to Microsoft documentation 