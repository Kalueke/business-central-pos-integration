# Contributing to Business Central POS Integration

Thank you for your interest in contributing to the Business Central POS Integration project! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Report issues you encounter
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit code changes or improvements
- **Documentation**: Improve or add documentation
- **Testing**: Help test the extension
- **Examples**: Share integration examples or use cases

### Getting Started

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your forked repository locally

2. **Set Up Development Environment**
   ```bash
   # Clone your fork
   git clone https://github.com/your-username/business-central-pos-integration.git
   cd business-central-pos-integration
   
   # Set up upstream remote
   git remote add upstream https://github.com/original-owner/business-central-pos-integration.git
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 📝 Development Guidelines

### Code Standards

#### AL Language Standards
- Follow Microsoft AL coding conventions
- Use meaningful variable and procedure names
- Add comments for complex logic
- Include proper error handling
- Use consistent indentation (4 spaces)

#### Example AL Code
```al
// Good example
local procedure ProcessSalesOrder(OrderData: JsonObject): Boolean
var
    Success: Boolean;
    SalesHeader: Record "Sales Header";
begin
    Success := true;
    
    try
        // Process order data
        if not ExtractOrderData(OrderData, SalesHeader) then
            Success := false;
    except
        Success := false;
        LogSyncActivity('Error', POSSyncLog.Status::Error, 
            'Failed to process sales order', GetLastErrorText());
    end;
    
    exit(Success);
end;
```

### Documentation Standards

- Write clear, concise documentation
- Include examples where appropriate
- Update documentation when adding features
- Use proper Markdown formatting
- Include screenshots for UI changes

### Testing Requirements

- Write tests for new features
- Ensure all existing tests pass
- Test with different Business Central versions
- Include integration tests where appropriate

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Business Central version
   - Operating system
   - Extension version
   - POS system details

2. **Steps to Reproduce**
   - Clear, step-by-step instructions
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Error Details**
   - Error messages
   - Stack traces
   - Log files

### Feature Requests

When requesting features, please include:

1. **Use Case**
   - What problem does this solve?
   - How would you use this feature?

2. **Proposed Solution**
   - How should the feature work?
   - Any specific requirements?

3. **Priority**
   - Is this a nice-to-have or critical?

## 🔄 Pull Request Process

### Before Submitting

1. **Test Your Changes**
   - Test in development environment
   - Run existing tests
   - Test with different scenarios

2. **Update Documentation**
   - Update relevant documentation
   - Add comments to code
   - Update README if needed

3. **Check Code Quality**
   - Follow coding standards
   - Remove debug code
   - Check for security issues

### Pull Request Guidelines

1. **Title and Description**
   - Use clear, descriptive titles
   - Explain what the PR does
   - Reference related issues

2. **Code Review**
   - Address review comments
   - Keep commits focused
   - Squash commits if needed

3. **Testing**
   - Ensure CI/CD passes
   - Test in target environment
   - Verify functionality

### Example Pull Request

```markdown
## Description
Adds inventory synchronization feature to the POS integration.

## Changes
- Added inventory sync procedure to POSIntegrationMgt codeunit
- Added inventory sync configuration options
- Updated documentation with inventory sync details

## Testing
- Tested with sample inventory data
- Verified sync log entries
- Tested error handling

## Related Issues
Closes #123
```

## 📋 Issue Templates

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Environment
- BC Version: [e.g., 22.0]
- OS: [e.g., Windows 10]
- Extension Version: [e.g., 1.0.0]

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Additional Information
Screenshots, logs, etc.
```

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Use Case
How would this feature be used?

## Proposed Solution
How should this feature work?

## Priority
- [ ] Low
- [ ] Medium
- [ ] High
- [ ] Critical

## Additional Information
Any other relevant details
```

## 🏷️ Labels and Milestones

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

### Milestones
- `v1.1`: Next minor release
- `v2.0`: Major release
- `backlog`: Future consideration

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For sensitive issues or private discussions

### Resources
- [Business Central Documentation](https://docs.microsoft.com/en-us/dynamics365/business-central/)
- [AL Language Documentation](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-al-language)
- [Extension Development Guide](https://docs.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-dev-overview)

## 🎉 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the Business Central POS Integration project! 🚀 