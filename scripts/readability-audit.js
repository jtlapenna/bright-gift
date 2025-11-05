#!/usr/bin/env node

/**
 * Readability Audit Script
 * 
 * Analyzes all blog posts and calculates Flesch Reading Score for body content only.
 * Excludes frontmatter and generates prioritized report.
 * 
 * Safety: This script only READS files, never modifies them.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = 'src/content/blog';
const OUTPUT_DIR = '_workflow-documents/SEO_audit';
const OUTPUT_FILE = 'readability-baseline-report.json';

class ReadabilityAuditor {
  constructor() {
    this.results = [];
  }

  /**
   * Get all blog post files
   */
  getBlogFiles() {
    const blogDir = path.join(process.cwd(), BLOG_DIR);
    if (!fs.existsSync(blogDir)) {
      console.error(`Error: Blog directory not found at ${blogDir}`);
      return [];
    }
    return fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(blogDir, file));
  }

  /**
   * Extract markdown content only (exclude frontmatter)
   */
  extractBodyContent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);
    
    // Return only the markdown content (body text after frontmatter)
    return {
      frontmatter,
      bodyContent: markdown.trim()
    };
  }

  /**
   * Calculate word count
   */
  calculateWordCount(content) {
    return content.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate syllable count for a word
   */
  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    // Remove silent 'e' at the end
    word = word.replace(/[^aeiouy]+e$/, '');
    
    // Count vowel groups
    const matches = word.match(/[aeiouy]+/g);
    return matches ? Math.max(1, matches.length) : 1;
  }

  /**
   * Estimate total syllables in content
   */
  estimateSyllables(content) {
    const words = content.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return words.reduce((count, word) => {
      return count + this.countSyllables(word);
    }, 0);
  }

  /**
   * Count sentences (ending with . ! ?)
   */
  countSentences(content) {
    // Remove common abbreviations that might be mistaken for sentence endings
    const cleaned = content
      .replace(/\.(com|net|org|edu|gov|io|co|uk|ca|au|etc|vs|ie|eg|mr|mrs|dr|prof|inc|llc|jr|sr)/gi, '')
      .replace(/\.\.\./g, '');
    
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return Math.max(1, sentences.length); // At least 1 sentence
  }

  /**
   * Calculate Flesch Reading Ease Score
   * Formula: 206.835 - (1.015 × ASL) - (84.6 × ASW)
   * ASL = Average Sentence Length (words per sentence)
   * ASW = Average Syllables per Word
   * 
   * Score ranges:
   * 90-100: Very Easy (5th grade)
   * 80-90: Easy (6th grade)
   * 70-80: Fairly Easy (7th grade)
   * 60-70: Standard (8th-9th grade) ← TARGET
   * 50-60: Fairly Difficult (10th-12th grade)
   * 30-50: Difficult (college)
   * 0-30: Very Difficult (college graduate)
   */
  calculateFleschScore(content) {
    const sentences = this.countSentences(content);
    const words = this.calculateWordCount(content);
    const syllables = this.estimateSyllables(content);
    
    if (words === 0 || sentences === 0) return 0;

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    // Round to 1 decimal place
    return Math.round(score * 10) / 10;
  }

  /**
   * Get readability status category
   */
  getReadabilityStatus(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard (Target)';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }

  /**
   * Get priority level for optimization
   */
  getPriority(score) {
    if (score < 50) return 'HIGH'; // Difficult to read
    if (score < 60) return 'MEDIUM'; // Below target
    if (score < 70) return 'LOW'; // Near target, minor improvements
    return 'REVIEW'; // At or above target
  }

  /**
   * Audit all blog posts
   */
  async auditAllPosts() {
    console.log('🔍 Starting readability audit for all blog posts...\n');
    
    const blogFiles = this.getBlogFiles();
    console.log(`📁 Found ${blogFiles.length} blog posts to analyze\n`);

    for (const filePath of blogFiles) {
      try {
        const { frontmatter, bodyContent } = this.extractBodyContent(filePath);
        const slug = path.basename(filePath, '.md');
        
        // Skip if no body content
        if (!bodyContent || bodyContent.trim().length === 0) {
          console.log(`⚠️  Skipping ${slug}: No body content found`);
          continue;
        }

        const readabilityScore = this.calculateFleschScore(bodyContent);
        const wordCount = this.calculateWordCount(bodyContent);
        const sentenceCount = this.countSentences(bodyContent);

        const result = {
          slug,
          title: frontmatter.title || slug,
          readabilityScore,
          wordCount,
          sentenceCount,
          status: this.getReadabilityStatus(readabilityScore),
          priority: this.getPriority(readabilityScore),
          date: frontmatter.date || null
        };

        this.results.push(result);
        
        // Progress indicator
        process.stdout.write(`✓ Analyzed: ${slug} (Score: ${readabilityScore})\n`);
      } catch (error) {
        console.error(`❌ Error analyzing ${path.basename(filePath)}:`, error.message);
      }
    }

    // Sort by readability score (lowest first - highest priority)
    this.results.sort((a, b) => a.readabilityScore - b.readabilityScore);

    // Save report
    this.saveReport();
    
    // Print summary
    this.printSummary();
  }

  /**
   * Save report to JSON file
   */
  saveReport() {
    const outputPath = path.join(process.cwd(), OUTPUT_DIR, OUTPUT_FILE);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      generatedAt: new Date().toISOString(),
      totalPosts: this.results.length,
      summary: {
        averageScore: this.calculateAverageScore(),
        highPriority: this.results.filter(r => r.priority === 'HIGH').length,
        mediumPriority: this.results.filter(r => r.priority === 'MEDIUM').length,
        lowPriority: this.results.filter(r => r.priority === 'LOW').length,
        atTarget: this.results.filter(r => r.priority === 'REVIEW').length
      },
      posts: this.results
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ Report saved to: ${outputPath}`);
  }

  /**
   * Calculate average readability score
   */
  calculateAverageScore() {
    if (this.results.length === 0) return 0;
    const sum = this.results.reduce((acc, r) => acc + r.readabilityScore, 0);
    return Math.round((sum / this.results.length) * 10) / 10;
  }

  /**
   * Print summary statistics
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 READABILITY AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n📝 Total Posts Analyzed: ${this.results.length}`);
    console.log(`📈 Average Flesch Score: ${this.calculateAverageScore()}%`);
    
    console.log('\n🎯 Priority Breakdown:');
    console.log(`   🔴 HIGH Priority (< 50%): ${this.results.filter(r => r.priority === 'HIGH').length} posts`);
    console.log(`   🟡 MEDIUM Priority (50-60%): ${this.results.filter(r => r.priority === 'MEDIUM').length} posts`);
    console.log(`   🟢 LOW Priority (60-70%): ${this.results.filter(r => r.priority === 'LOW').length} posts`);
    console.log(`   ✅ At Target (70%+): ${this.results.filter(r => r.priority === 'REVIEW').length} posts`);

    console.log('\n📋 Top 10 Posts Needing Optimization (Lowest Scores):');
    this.results.slice(0, 10).forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.slug} - ${post.readabilityScore}% (${post.status})`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Audit complete! Check the report for full details.');
    console.log('='.repeat(60) + '\n');
  }
}

// Run the audit
const auditor = new ReadabilityAuditor();
auditor.auditAllPosts().catch(console.error);

