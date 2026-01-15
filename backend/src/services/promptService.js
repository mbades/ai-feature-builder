const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const { CacheService } = require('./cacheService');

/**
 * Service for managing AI prompts
 * Separates prompt management from AI service
 */
class PromptService {
  constructor() {
    this.cache = new CacheService('prompts');
    this.systemPrompt = null;
    this.promptTemplates = new Map();
  }

  /**
   * Load system prompt from file with caching
   */
  async getSystemPrompt() {
    const cacheKey = 'system_prompt';
    
    // Try cache first
    let prompt = this.cache.get(cacheKey);
    if (prompt) {
      return prompt;
    }

    try {
      const promptPath = path.join(config.paths.prompts, 'generateFeature.optimized.prompt.md');
      const promptContent = await fs.readFile(promptPath, 'utf8');
      
      // Process and clean the prompt
      prompt = this.processPromptContent(promptContent);
      
      // Cache the processed prompt
      this.cache.set(cacheKey, prompt);
      
      logger.info('System prompt loaded and cached', {
        promptLength: prompt.length,
        source: promptPath
      });
      
      return prompt;
    } catch (error) {
      logger.error('Failed to load system prompt', { 
        error: error.message,
        path: config.paths.prompts 
      });
      throw new Error('System prompt not available');
    }
  }

  /**
   * Process raw prompt content to clean format
   */
  processPromptContent(content) {
    return content
      .replace(/^# .*$/gm, '') // Remove main headers
      .replace(/^## .*$/gm, '') // Remove section headers
      .replace(/^### .*$/gm, '') // Remove subsection headers
      .replace(/```json[\s\S]*?```/g, '') // Remove JSON examples in code blocks
      .replace(/```[\s\S]*?```/g, '') // Remove other code blocks
      .replace(/^\s*[-*] /gm, '• ') // Convert markdown lists to bullet points
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();
  }

  /**
   * Build user prompt from input with template context
   */
  buildUserPrompt(input, templateContext = null) {
    let prompt = `Please analyze this feature description and generate a complete technical specification:\n\n`;
    prompt += `**Description:** ${input.description}\n\n`;
    
    if (input.language && input.language !== 'it') {
      prompt += `**Language:** ${input.language}\n\n`;
    }
    
    if (input.template && templateContext) {
      prompt += `**Template Context:** This is a ${templateContext.name} feature\n`;
      prompt += `**Template Description:** ${templateContext.description}\n`;
      prompt += `**Common Requirements:** ${templateContext.commonRequirements.join(', ')}\n\n`;
    }
    
    if (input.complexity) {
      prompt += `**Expected Complexity:** ${input.complexity}\n\n`;
    }
    
    if (input.includeTests) {
      prompt += `**Testing:** Include comprehensive test cases and edge case scenarios\n\n`;
    }
    
    prompt += `Please return a valid JSON response following the exact schema specified in your instructions.`;
    
    return prompt;
  }

  /**
   * Get prompt template by type
   */
  async getPromptTemplate(type) {
    const cacheKey = `template_${type}`;
    
    let template = this.cache.get(cacheKey);
    if (template) {
      return template;
    }

    try {
      const templatePath = path.join(config.paths.prompts, `${type}.prompt.md`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      template = this.processPromptContent(templateContent);
      this.cache.set(cacheKey, template);
      
      return template;
    } catch (error) {
      logger.warn(`Prompt template not found: ${type}`, { error: error.message });
      
      // Return a basic fallback template instead of null
      const fallbackTemplate = `You are a software architect. Generate a technical specification for: ${type}`;
      logger.info(`Using fallback template for: ${type}`);
      
      return fallbackTemplate;
    }
  }

  /**
   * Validate prompt content
   */
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt content');
    }

    if (prompt.length < 100) {
      throw new Error('Prompt too short');
    }

    if (prompt.length > 50000) {
      throw new Error('Prompt too long');
    }

    // Check for required sections
    const requiredSections = [
      'technical specification',
      'JSON',
      'requirements',
      'architecture'
    ];

    const lowerPrompt = prompt.toLowerCase();
    const missingSections = requiredSections.filter(section => 
      !lowerPrompt.includes(section)
    );

    if (missingSections.length > 0) {
      logger.warn('Prompt missing required sections', { missingSections });
    }

    return true;
  }

  /**
   * Clear prompt cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Prompt cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}

const promptService = new PromptService();

module.exports = {
  promptService,
  PromptService
};