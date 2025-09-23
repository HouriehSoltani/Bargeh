# Bargeh Admin Guide

## 🎯 Overview

The Bargeh admin interface provides comprehensive management capabilities for the course management system. This guide covers all admin features and best practices.

## 🚀 Accessing the Admin

1. **URL**: `http://127.0.0.1:8000/admin/`
2. **Login**: Use your superuser credentials
   - Email: `soltanihoorie@gmail.com`
   - Password: (your superuser password)

## 📊 Dashboard

The custom dashboard provides:
- **System Statistics**: Total users, courses, assignments, submissions, grades
- **Active Students**: Count of enrolled students
- **Instructors**: Count of course instructors
- **Recent Activity**: Latest courses and submissions

## 👥 User Management

### User Admin Features
- **List View**: Email, name, status, permissions, dates
- **Search**: By email, name, first name, last name
- **Filters**: Active status, staff status, superuser status, dates
- **Bulk Actions**: Activate/deactivate users
- **Autocomplete**: Fast user selection in related fields

### User Fields
- **Email**: Primary identifier (readonly after creation)
- **Name**: Display name
- **Permissions**: Staff, superuser, groups, permissions
- **Timestamps**: Last login, date joined

## 📚 Course Management

### Course Admin Features
- **List View**: Code, title, instructor, student count, invite code, created date
- **Search**: By title, code, description, instructor
- **Filters**: By creation date, instructor
- **Inline Memberships**: Manage course enrollments directly
- **Bulk Actions**: Regenerate invite codes

### Course Fields
- **Title**: Course name
- **Code**: Course identifier (e.g., CS101)
- **Description**: Course details
- **Instructor**: Course owner
- **Invite Code**: Unique enrollment code (auto-generated)

### Course Membership Management
- **Roles**: Instructor, TA, Student
- **Bulk Enrollment**: Add multiple users to courses
- **Role Management**: Change user roles within courses

## 📝 Assignment Management

### Assignment Admin Features
- **List View**: Title, course, due date, points, published status, version count
- **Search**: By title, instructions, course
- **Filters**: Published status, creation date, course
- **Inline Versions**: Manage assignment versions
- **Bulk Actions**: Publish/unpublish assignments

### Assignment Version Management
- **Version Labels**: A, B, C, etc.
- **Due Dates**: Per-version deadlines
- **Inline Questions**: Manage questions within versions

### Question Management
- **Question Numbers**: Sequential numbering
- **Points**: Maximum points per question
- **Inline Rubric**: Manage grading criteria

### Rubric Item Management
- **Labels**: Rubric item names
- **Point Deltas**: Positive/negative point adjustments
- **Descriptions**: Detailed criteria

## 📤 Submission Management

### Submission Admin Features
- **List View**: Student, assignment, status, submission date, late minutes, attempt
- **Search**: By student email/name, assignment title
- **Filters**: Status, submission date, course, attempt number
- **Status Tracking**: Pending, Graded, Released

### Submission Fields
- **Student**: Submitter
- **Assignment Version**: Specific version submitted
- **Status**: Current grading status
- **Late Minutes**: Tardiness tracking
- **Attempt**: Submission attempt number

## 📊 Grade Management

### Grade Admin Features
- **List View**: Submission, question, grader, points awarded, adjustments, graded date
- **Search**: By student email, question title, grader
- **Filters**: Graded date, course, grader
- **Inline Rubric Items**: Selected grading criteria

### Grade Fields
- **Points Awarded**: Base points
- **Point Adjustment**: Manual adjustments
- **Comments**: Grading feedback
- **Grader**: Who graded the submission

## 🔧 Admin Actions

### Course Actions
- **Regenerate Invite Codes**: Generate new enrollment codes
- **Bulk Course Operations**: Manage multiple courses

### User Actions
- **Activate/Deactivate**: Enable/disable user accounts
- **Bulk Permission Changes**: Modify user permissions

## 🎨 Customization Features

### Visual Enhancements
- **Custom Branding**: Bargeh-specific styling
- **Color Scheme**: Professional blue theme
- **Dashboard**: Custom statistics and recent activity
- **Responsive Design**: Mobile-friendly interface

### Performance Optimizations
- **Select Related**: Optimized database queries
- **Autocomplete Fields**: Fast foreign key selection
- **Prefetch Related**: Efficient related object loading

## 🔍 Search and Filtering

### Global Search
- **Cross-Model Search**: Find related objects quickly
- **Autocomplete**: Fast selection in dropdowns
- **Smart Filters**: Context-aware filtering options

### Advanced Filtering
- **Date Ranges**: Filter by creation/modification dates
- **Status Filters**: Active/inactive, published/unpublished
- **Relationship Filters**: Filter by related objects

## 📈 Best Practices

### Data Management
1. **Use Bulk Actions**: For multiple record operations
2. **Leverage Inlines**: For related object management
3. **Monitor Performance**: Use select_related for large datasets
4. **Regular Backups**: Export important data regularly

### User Experience
1. **Use Autocomplete**: For foreign key fields
2. **Organize Fieldsets**: Group related fields logically
3. **Provide Help Text**: Add descriptions for complex fields
4. **Use Readonly Fields**: For calculated or system fields

### Security
1. **Limit Permissions**: Grant minimum required access
2. **Monitor Activity**: Review admin logs regularly
3. **Use HTTPS**: In production environments
4. **Regular Updates**: Keep Django and dependencies updated

## 🚨 Troubleshooting

### Common Issues
1. **Permission Denied**: Check user permissions and groups
2. **Slow Loading**: Optimize queries with select_related
3. **Missing Data**: Verify foreign key relationships
4. **Template Errors**: Check template syntax and inheritance

### Performance Issues
1. **Database Queries**: Use Django Debug Toolbar
2. **Memory Usage**: Monitor large dataset operations
3. **Page Load Times**: Optimize admin list views
4. **Search Performance**: Index frequently searched fields

## 📞 Support

For admin-related issues:
1. Check Django admin documentation
2. Review model relationships
3. Verify user permissions
4. Check database constraints

---

**Note**: This admin interface is designed for development and testing. For production use, consider additional security measures and performance optimizations.
