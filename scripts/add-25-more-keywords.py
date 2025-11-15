#!/usr/bin/env python3
"""
Add 25 more keywords to reach 100 total keywords
"""

import json
from pathlib import Path

def main():
    # Load existing keyword list
    with open('_workflow-documents/REFERENCE/seo/final-keyword-list-2025.json', 'r') as f:
        data = json.load(f)
    
    existing_keywords = [kw['keyword'].lower() for kw in data['keyword_list']['keywords']]
    
    # Load Semrush analysis to find candidates
    with open('_workflow-documents/REFERENCE/seo/semrush-seniors-analysis.json', 'r') as f:
        semrush_data = json.load(f)
    
    # Get all keywords from Semrush
    all_semrush = semrush_data['high_value'] + semrush_data['medium_value']
    
    # Find candidates not already in list
    candidates = []
    for kw in all_semrush:
        if kw['keyword'].lower() not in existing_keywords:
            # Calculate score: volume * (1 - difficulty/100)
            volume = kw.get('volume', 0)
            difficulty = kw.get('difficulty', 100)
            score = volume * (1 - difficulty/100)
            kw['score'] = score
            candidates.append(kw)
    
    # Sort by score and take top 25
    candidates.sort(key=lambda x: x['score'], reverse=True)
    top_25 = candidates[:25]
    
    # Format new keywords to match existing structure
    new_keywords = []
    for kw in top_25:
        new_kw = {
            'keyword': kw['keyword'],
            'volume': kw.get('volume', 0),
            'difficulty': kw.get('difficulty', 0),
            'intent': kw.get('intent', ''),
            'topic': kw.get('topic', ''),
            'source': 'semrush_2025',
            'category': kw.get('topic', '').replace('gifts for ', '').replace(' ', '_').lower()
        }
        new_keywords.append(new_kw)
    
    # Add to existing list
    data['keyword_list']['keywords'].extend(new_keywords)
    data['keyword_list']['total_keywords'] = len(data['keyword_list']['keywords'])
    data['keyword_list']['new_count'] = data['keyword_list']['new_count'] + 25
    
    # Update rank trackers (replace the 3 we identified)
    rank_trackers = data['rank_trackers']['rank_trackers']
    
    # Remove: mother's day gift ideas, valentine's day gifts under $50, romantic gifts under $50
    rank_trackers = [rt for rt in rank_trackers if rt['keyword'] not in [
        "mother's day gift ideas",
        "valentine's day gifts under $50",
        "romantic gifts under $50"
    ]]
    
    # Add new trackers
    new_trackers = [
        {'keyword': 'gifts for elderly women', 'volume': 2900, 'difficulty': 21, 'intent': 'Informational, Commercial', 'topic': 'gifts for seniors', 'source': 'semrush_2025', 'category': 'seniors'},
        {'keyword': 'best gifts for teachers', 'volume': 2900, 'difficulty': 30, 'intent': 'Commercial', 'topic': 'teacher appreciation gifts', 'source': 'semrush_2025', 'category': 'teacher_appreciation_gifts'},
        {'keyword': 'gifts for new grandparents', 'volume': 2400, 'difficulty': 24, 'intent': 'Commercial', 'topic': 'gifts for grandparents', 'source': 'semrush_2025', 'category': 'grandparents'}
    ]
    
    rank_trackers.extend(new_trackers)
    
    # Sort rank trackers by volume
    rank_trackers.sort(key=lambda x: x.get('volume', 0) if isinstance(x.get('volume'), int) else 0, reverse=True)
    data['rank_trackers']['rank_trackers'] = rank_trackers[:10]
    
    # Save updated data
    with open('_workflow-documents/REFERENCE/seo/final-keyword-list-2025.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Added {len(new_keywords)} new keywords")
    print(f"Total keywords now: {data['keyword_list']['total_keywords']}")
    print(f"\nNew keywords added:")
    for i, kw in enumerate(new_keywords, 1):
        print(f"{i:2d}. {kw['keyword'][:60]:60s} | Vol: {kw.get('volume', 0):4d} | KD: {kw.get('difficulty', 0):2d}")
    
    print(f"\nUpdated rank trackers: {len(data['rank_trackers']['rank_trackers'])}")

if __name__ == '__main__':
    main()

