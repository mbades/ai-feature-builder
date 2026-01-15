#!/usr/bin/env node

/**
 * Utility script to validate AI responses manually
 * Usage: npm run validate:ai-response -- path/to/response.json
 */

const fs = require('fs');
const path = require('path');
const { AIResponseValidator } = require('../src/validators/aiResponseValidator');

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: npm run validate:ai-response -- <path-to-json-file>');
    process.exit(1);
  }

  const filePath = args[0];
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    console.log(`Validating AI response: ${filePath}`);
    console.log('=' .repeat(50));
    
    const content = fs.readFileSync(filePath, 'utf8');
    const response = JSON.parse(content);
    
    const startTime = Date.now();
    const result = AIResponseValidator.validate(response, 'manual-validation');
    const validationTime = Date.now() - startTime;
    
    console.log('✅ Validation PASSED');
    console.log(`⏱️  Validation time: ${validationTime}ms`);
    console.log('');
    
    // Print summary
    const data = result.data;
    console.log('📊 Summary:');
    console.log(`   Feature: ${data.metadata.name}`);
    console.log(`   Complexity: ${data.metadata.complexity}`);
    console.log(`   Estimated Hours: ${data.metadata.estimatedHours}`);
    console.log(`   Functional Requirements: ${data.requirements.functional.length}`);
    console.log(`   Non-Functional Requirements: ${data.requirements.nonFunctional.length}`);
    console.log(`   API Endpoints: ${data.architecture.apiEndpoints.length}`);
    console.log(`   Data Models: ${data.architecture.dataModels.length}`);
    console.log(`   Test Cases: ${data.testing.testCases.length}`);
    console.log(`   Acceptance Criteria: ${data.testing.acceptanceCriteria.length}`);
    
  } catch (error) {
    console.error('❌ Validation FAILED');
    console.error('');
    
    if (error.name === 'AIValidationError') {
      console.error(`Error Code: ${error.code}`);
      console.error(`Message: ${error.message}`);
      
      if (error.details && error.details.length > 0) {
        console.error('');
        console.error('Validation Errors:');
        error.details.slice(0, 10).forEach((detail, index) => {
          console.error(`  ${index + 1}. Field: ${detail.field}`);
          console.error(`     Message: ${detail.message}`);
          if (detail.value !== undefined) {
            console.error(`     Value: ${JSON.stringify(detail.value)}`);
          }
          console.error('');
        });
        
        if (error.details.length > 10) {
          console.error(`     ... and ${error.details.length - 10} more errors`);
        }
      }
    } else if (error.name === 'SyntaxError') {
      console.error('Invalid JSON format:');
      console.error(error.message);
    } else {
      console.error('Unexpected error:');
      console.error(error.message);
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}