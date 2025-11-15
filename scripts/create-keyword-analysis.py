#!/usr/bin/env python3
"""
Create comprehensive keyword analysis combining existing and new Semrush data
"""

import json
from pathlib import Path

def load_semrush_analysis():
    """Load Semrush analysis"""
    with open('_workflow-documents/REFERENCE/seo/semrush-seniors-analysis.json', 'r') as f:
        return json.load(f)

def get_existing_keywords():
    """Extract existing keywords from previous research"""
    existing = {
        # From comprehensive-keyword-research-summary.md
        'valentines_day': [
            {"keyword": "valentine's day gifts under $50", "volume": 8100, "difficulty": "low"},
            {"keyword": "romantic gifts under $50", "volume": 3600, "difficulty": "low"},
            {"keyword": "valentine's day gift ideas", "volume": 12000, "difficulty": "low"},
            {"keyword": "romantic valentine's day gifts", "volume": 2900, "difficulty": "low"},
            {"keyword": "cheap valentine's day gifts", "volume": 1200, "difficulty": "low"},
        ],
        'mothers_day': [
            {"keyword": "mother's day gifts", "volume": 22000, "difficulty": "low"},
            {"keyword": "gifts for mom", "volume": 18000, "difficulty": "low"},
            {"keyword": "mother's day gift ideas", "volume": 8800, "difficulty": "low"},
            {"keyword": "unique mother's day gifts", "volume": 2900, "difficulty": "low"},
            {"keyword": "personalized mother's day gifts", "volume": 1800, "difficulty": "low"},
        ],
        'christmas': [
            {"keyword": "christmas gift ideas", "volume": 40500, "difficulty": "medium"},
            {"keyword": "christmas gifts for everyone", "volume": 2900, "difficulty": "medium"},
            {"keyword": "christmas gift guide", "volume": 8100, "difficulty": "medium"},
            {"keyword": "unique christmas gifts", "volume": 4400, "difficulty": "medium"},
            {"keyword": "christmas gifts under $50", "volume": 3600, "difficulty": "medium"},
        ],
        'remote_workers': [
            {"keyword": "gifts for remote workers", "volume": 1600, "difficulty": "low"},
            {"keyword": "work from home gifts", "volume": 1200, "difficulty": "low"},
            {"keyword": "home office gifts", "volume": 2900, "difficulty": "low"},
            {"keyword": "wfh gift ideas", "volume": 800, "difficulty": "low"},
            {"keyword": "remote work essentials", "volume": 1200, "difficulty": "low"},
        ],
        'teens': [
            {"keyword": "gifts for teenagers", "volume": 3600, "difficulty": "medium"},
            {"keyword": "teen birthday gifts", "volume": 2400, "difficulty": "medium"},
            {"keyword": "gifts for gen z", "volume": 1200, "difficulty": "medium"},
            {"keyword": "cool gifts for teens", "volume": 1800, "difficulty": "medium"},
            {"keyword": "teenage girl gifts", "volume": 2900, "difficulty": "medium"},
        ],
    }
    
    # Flatten to single list
    all_existing = []
    for category, keywords in existing.items():
        for kw in keywords:
            kw['category'] = category
            kw['source'] = 'existing_research'
            all_existing.append(kw)
    
    return all_existing

def create_final_keyword_list():
    """Create final updated keyword list"""
    semrush_data = load_semrush_analysis()
    existing_keywords = get_existing_keywords()
    
    # Get top keywords from Semrush
    semrush_top = semrush_data['high_value'][:50]  # Top 50 from Semrush
    
    # Convert to same format
    semrush_formatted = []
    for kw in semrush_top:
        semrush_formatted.append({
            'keyword': kw['keyword'],
            'volume': kw['volume'],
            'difficulty': kw['difficulty'],
            'intent': kw.get('intent', ''),
            'topic': kw.get('topic', ''),
            'source': 'semrush_2025',
            'category': kw.get('topic', '').replace('gifts for ', '').replace(' ', '_').lower()
        })
    
    # Combine existing and new, removing duplicates
    seen_keywords = set()
    final_list = []
    
    # Add existing first (priority)
    for kw in existing_keywords:
        kw_lower = kw['keyword'].lower()
        if kw_lower not in seen_keywords:
            seen_keywords.add(kw_lower)
            final_list.append(kw)
    
    # Add new from Semrush
    for kw in semrush_formatted:
        kw_lower = kw['keyword'].lower()
        if kw_lower not in seen_keywords:
            seen_keywords.add(kw_lower)
            final_list.append(kw)
    
    # Sort by volume (estimated for existing, actual for Semrush)
    def sort_key(kw):
        if isinstance(kw.get('volume'), int):
            return kw['volume']
        return 0
    
    final_list.sort(key=sort_key, reverse=True)
    
    return {
        'total_keywords': len(final_list),
        'existing_count': len(existing_keywords),
        'new_count': len(semrush_formatted),
        'keywords': final_list[:100],  # Top 100 final keywords
        'generated_date': '2025-01-14'
    }

def create_rank_tracker_list(keyword_list):
    """Create top 10 rank trackers based on highest volume/commercial intent"""
    # Filter for high-volume, commercial intent keywords
    commercial_keywords = [kw for kw in keyword_list['keywords'] 
                          if 'commercial' in str(kw.get('intent', '')).lower() 
                          or kw.get('volume', 0) >= 2000]
    
    # Sort by volume
    commercial_keywords.sort(key=lambda x: x.get('volume', 0), reverse=True)
    
    # Select top 10
    trackers = commercial_keywords[:10]
    
    return {
        'rank_trackers': trackers,
        'tracking_period': 'weekly',
        'tools': ['Ahrefs', 'Google Search Console', 'Semrush']
    }

def main():
    print("Creating final keyword list...")
    
    final_keywords = create_final_keyword_list()
    rank_trackers = create_rank_tracker_list(final_keywords)
    
    output = {
        'keyword_list': final_keywords,
        'rank_trackers': rank_trackers,
        'metadata': {
            'analysis_date': '2025-01-14',
            'sources': ['existing_research', 'semrush_2025'],
            'criteria': {
                'minimum_volume': 50,
                'maximum_difficulty': 30,
                'priority': 'commercial_intent'
            }
        }
    }
    
    # Save to JSON
    output_path = Path('_workflow-documents/REFERENCE/seo/final-keyword-list-2025.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\nFinal Keyword List Created:")
    print(f"  Total keywords: {final_keywords['total_keywords']}")
    print(f"  Existing keywords: {final_keywords['existing_count']}")
    print(f"  New keywords from Semrush: {final_keywords['new_count']}")
    print(f"  Top 100 keywords: {len(final_keywords['keywords'])}")
    print(f"  Rank trackers: {len(rank_trackers['rank_trackers'])}")
    print(f"\nSaved to: {output_path}")
    
    # Print top 20 keywords
    print(f"\nTop 20 Final Keywords:")
    for i, kw in enumerate(final_keywords['keywords'][:20], 1):
        vol = kw.get('volume', 'N/A')
        print(f"{i:2d}. {kw['keyword'][:60]:60s} | Vol: {vol}")
    
    # Print rank trackers
    print(f"\nTop 10 Rank Trackers:")
    for i, kw in enumerate(rank_trackers['rank_trackers'], 1):
        vol = kw.get('volume', 'N/A')
        print(f"{i:2d}. {kw['keyword'][:60]:60s} | Vol: {vol}")

if __name__ == '__main__':
    main()

