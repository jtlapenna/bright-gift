#!/usr/bin/env python3
"""
Analyze Semrush CSV export and extract high-value keywords
"""

import csv
import json
from collections import defaultdict
from pathlib import Path

def parse_csv(filepath):
    """Parse Semrush CSV and extract keyword data"""
    keywords = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                # Clean and parse numeric fields
                volume = int(row['Volume']) if row.get('Volume') and row['Volume'].strip() else 0
                difficulty = int(row['Keyword Difficulty']) if row.get('Keyword Difficulty') and row['Keyword Difficulty'].strip() else 0
                cpc = float(row['CPC (USD)']) if row.get('CPC (USD)') and row['CPC (USD)'].strip() else 0.0
                
                keyword_data = {
                    'keyword': row.get('Keyword', '').strip(),
                    'seed_keyword': row.get('Seed keyword', '').strip(),
                    'topic': row.get('Topic', '').strip(),
                    'volume': volume,
                    'difficulty': difficulty,
                    'cpc': cpc,
                    'intent': row.get('Intent', '').strip(),
                    'serp_features': row.get('SERP Features', '').strip(),
                }
                
                if keyword_data['keyword']:  # Only add non-empty keywords
                    keywords.append(keyword_data)
            except (ValueError, KeyError) as e:
                continue
    
    return keywords

def analyze_keywords(keywords):
    """Analyze keywords and categorize by value"""
    
    # Filter criteria for high-value keywords
    high_value = []
    medium_value = []
    
    for kw in keywords:
        volume = kw['volume']
        difficulty = kw['difficulty']
        intent = kw.get('intent', '').lower()
        
        # High-value: Good volume (70+), reasonable difficulty (30 or less), commercial intent
        if volume >= 70 and difficulty <= 30:
            score = volume * (1 - difficulty/100)  # Higher volume, lower difficulty = better
            kw['score'] = score
            if 'commercial' in intent or volume >= 200:
                high_value.append(kw)
            else:
                medium_value.append(kw)
        elif volume >= 50 and difficulty <= 25:
            score = volume * (1 - difficulty/100)
            kw['score'] = score
            medium_value.append(kw)
    
    # Sort by score (volume-weighted by difficulty)
    high_value.sort(key=lambda x: x['score'], reverse=True)
    medium_value.sort(key=lambda x: x['score'], reverse=True)
    
    # Group by topic/seed keyword
    by_topic = defaultdict(list)
    for kw in high_value + medium_value:
        topic = kw.get('topic') or kw.get('seed_keyword', 'Other')
        by_topic[topic].append(kw)
    
    return {
        'high_value': high_value[:100],  # Top 100 high-value
        'medium_value': medium_value[:100],  # Top 100 medium-value
        'by_topic': dict(by_topic),
        'total_keywords': len(keywords),
        'analyzed_keywords': len(high_value) + len(medium_value)
    }

def main():
    csv_path = Path('_workflow-documents/gifts-for-seniors_clusters_2025-11-14.csv')
    
    print(f"Analyzing {csv_path}...")
    keywords = parse_csv(csv_path)
    print(f"Parsed {len(keywords)} keywords")
    
    analysis = analyze_keywords(keywords)
    
    print(f"\nAnalysis Results:")
    print(f"Total keywords: {analysis['total_keywords']}")
    print(f"High-value keywords: {len(analysis['high_value'])}")
    print(f"Medium-value keywords: {len(analysis['medium_value'])}")
    
    print(f"\nTop 20 High-Value Keywords:")
    for i, kw in enumerate(analysis['high_value'][:20], 1):
        print(f"{i:2d}. {kw['keyword'][:60]:60s} | Vol: {kw['volume']:4d} | KD: {kw['difficulty']:2d} | Intent: {kw['intent'][:20]}")
    
    # Save analysis to JSON
    output_path = Path('_workflow-documents/REFERENCE/seo/semrush-seniors-analysis.json')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)
    
    print(f"\nAnalysis saved to: {output_path}")

if __name__ == '__main__':
    main()

