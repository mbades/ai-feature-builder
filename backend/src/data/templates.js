/**
 * Feature templates configuration
 * Moved from hardcoded controller to separate data file
 */
const templates = [
  {
    id: 'crud',
    name: 'CRUD Operations',
    description: 'Create, Read, Update, Delete operations for data management',
    example: 'I need a user management system with create, read, update, and delete operations',
    category: 'data-management',
    complexity: 'simple',
    estimatedHours: 16,
    commonRequirements: [
      'Data validation',
      'Database operations',
      'REST API endpoints',
      'Error handling'
    ]
  },
  {
    id: 'auth',
    name: 'Authentication',
    description: 'User authentication and authorization systems',
    example: 'I need a login system with user registration and password reset',
    category: 'security',
    complexity: 'medium',
    estimatedHours: 28,
    commonRequirements: [
      'User registration',
      'Login/logout',
      'Password hashing',
      'JWT tokens',
      'Session management'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online shopping and payment processing features',
    example: 'I need a shopping cart with product catalog and checkout process',
    category: 'business',
    complexity: 'complex',
    estimatedHours: 48,
    commonRequirements: [
      'Product catalog',
      'Shopping cart',
      'Payment processing',
      'Order management',
      'Inventory tracking'
    ]
  },
  {
    id: 'api',
    name: 'API Integration',
    description: 'External API integrations and data synchronization',
    example: 'I need to integrate with a payment gateway and send email notifications',
    category: 'integration',
    complexity: 'medium',
    estimatedHours: 24,
    commonRequirements: [
      'External API calls',
      'Data transformation',
      'Error handling',
      'Rate limiting',
      'Webhook handling'
    ]
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Data visualization and reporting interfaces',
    example: 'I need an admin dashboard with charts and user analytics',
    category: 'analytics',
    complexity: 'medium',
    estimatedHours: 32,
    commonRequirements: [
      'Data aggregation',
      'Chart generation',
      'Real-time updates',
      'Export functionality',
      'User permissions'
    ]
  },
  {
    id: 'notification',
    name: 'Notification System',
    description: 'Email, SMS, and push notification systems',
    example: 'I need to send email notifications and push notifications to users',
    category: 'communication',
    complexity: 'medium',
    estimatedHours: 20,
    commonRequirements: [
      'Email templates',
      'Push notifications',
      'SMS integration',
      'Notification preferences',
      'Delivery tracking'
    ]
  },
  {
    id: 'file-upload',
    name: 'File Management',
    description: 'File upload, storage, and processing systems',
    example: 'I need users to upload images and documents with validation and storage',
    category: 'storage',
    complexity: 'medium',
    estimatedHours: 18,
    commonRequirements: [
      'File validation',
      'Cloud storage',
      'Image processing',
      'File metadata',
      'Access control'
    ]
  }
];

/**
 * Get all templates
 */
const getAllTemplates = () => templates;

/**
 * Get template by ID
 */
const getTemplateById = (id) => templates.find(template => template.id === id);

/**
 * Get templates by category
 */
const getTemplatesByCategory = (category) => 
  templates.filter(template => template.category === category);

/**
 * Get templates by complexity
 */
const getTemplatesByComplexity = (complexity) =>
  templates.filter(template => template.complexity === complexity);

/**
 * Search templates by keyword
 */
const searchTemplates = (keyword) => {
  const searchTerm = keyword.toLowerCase();
  return templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.commonRequirements.some(req => req.toLowerCase().includes(searchTerm))
  );
};

module.exports = {
  templates,
  getAllTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByComplexity,
  searchTemplates
};