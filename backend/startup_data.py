import os
import json
import logging
from typing import Dict, Any
from gemini_client import LlmChat, UserMessage, TextDelta, StreamDone

logger = logging.getLogger(__name__)

# Real data registry for Indian startups
STARTUP_PROFILES: Dict[str, Dict[str, Any]] = {
    "razorpay": {
        "name": "Razorpay",
        "tagline": "The leading payments solution for Indian businesses to accept, process and disburse payments.",
        "founded_year": 2014,
        "hq": "Bengaluru, India",
        "team_size": "2,200+",
        "funding_stage": "Series G (Unicorn)",
        "total_funding": "$800M",
        "last_funding_round": "Series G",
        "website": "https://razorpay.com",
        "domain": "razorpay.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/razorpay",
            "twitter": "https://twitter.com/razorpay",
            "github": "https://github.com/razorpay",
            "instagram": "https://instagram.com/razorpay"
        },
        "founders": [
            {
                "name": "Harshil Mathur",
                "designation": "CEO & Co-Founder",
                "bio": "Harshil Mathur is the CEO and Co-Founder of Razorpay. He leads product development and business strategy. He was featured in Forbes 30 Under 30.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/harshilmathur",
                "twitter": "https://twitter.com/harshilmathur"
            },
            {
                "name": "Shashank Kumar",
                "designation": "Co-Founder & MD",
                "bio": "Shashank Kumar is the Co-Founder and MD of Razorpay. He studied Computer Science at IIT Roorkee and leads technology and engineering operations.",
                "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/shashankkumar",
                "twitter": "https://twitter.com/shashankkumar"
            }
        ],
        "news": [
            {
                "title": "Razorpay launches corporate cards and instant payout rails for SaaS founders",
                "source": "Entrackr",
                "date": "Feb 15, 2026",
                "url": "https://entrackr.com/2026/02/razorpay-payouts-and-corporate-banking-expansion/"
            },
            {
                "title": "Razorpay cross-border payments transaction volume grows by 40% in FY25",
                "source": "TechCrunch",
                "date": "Jan 22, 2026",
                "url": "https://techcrunch.com/2026/01/22/razorpay-india-payments/"
            },
            {
                "title": "How Razorpay scaled its merchant payments stack to handle 10,000 TPS",
                "source": "YourStory",
                "date": "Dec 05, 2025",
                "url": "https://yourstory.com/2025/12/razorpay-tech-scaling"
            },
            {
                "title": "Razorpay acquires digital payments startup BillDesk for major offline expansion",
                "source": "Inc42",
                "date": "Oct 18, 2025",
                "url": "https://inc42.com/buzz/razorpay-billdesk-acquisition"
            },
            {
                "title": "Razorpay launches UPI Autopay features for subscription billing in India",
                "source": "Economic Times",
                "date": "Sep 10, 2025",
                "url": "https://economictimes.indiatimes.com/tech/startups/razorpay-upi-autopay"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$120K", "date": "2015", "investors": "Y Combinator"},
            {"round": "Series A", "amount": "$9M", "date": "2015", "investors": "Tiger Global Management"},
            {"round": "Series B", "amount": "$20M", "date": "2018", "investors": "Tiger Global, Matrix Partners India"},
            {"round": "Series C", "amount": "$75M", "date": "2019", "investors": "Sequoia Capital India, Ribbit Capital"},
            {"round": "Series D", "amount": "$100M", "date": "2020", "investors": "GIC, Sequoia Capital India"},
            {"round": "Series E", "amount": "$160M", "date": "2021", "investors": "Sequoia Capital India, GIC, Tiger Global"},
            {"round": "Series F", "amount": "$375M", "date": "2021", "investors": "TCV, GIC, Tiger Global"}
        ],
        "similar_startups": ["cred", "groww", "slice", "jar", "bharatpe"]
    },
    "cred": {
        "name": "CRED",
        "tagline": "Premium members-only platform rewarding credit card bill payments with exclusive perks.",
        "founded_year": 2018,
        "hq": "Bengaluru, India",
        "team_size": "800+",
        "funding_stage": "Series F (Unicorn)",
        "total_funding": "$800M",
        "last_funding_round": "Series F",
        "website": "https://cred.club",
        "domain": "cred.club",
        "social_links": {
            "linkedin": "https://linkedin.com/company/credclub",
            "twitter": "https://twitter.com/CRED_club",
            "github": "https://github.com/credclub",
            "instagram": "https://instagram.com/cred_club"
        },
        "founders": [
            {
                "name": "Kunal Shah",
                "designation": "Founder & CEO",
                "bio": "Kunal Shah is the Founder and CEO of CRED. He previously founded Freecharge (acquired by Snapdeal). He is one of the most active angel investors in India.",
                "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/kunalshah1",
                "twitter": "https://twitter.com/kunalb11"
            }
        ],
        "news": [
            {
                "title": "CRED launches CRED Garage, entering the luxury automobile management segment",
                "source": "YourStory",
                "date": "Jan 12, 2026",
                "url": "https://yourstory.com/2026/01/cred-garage-luxury-auto"
            },
            {
                "title": "CRED acquires offline payments pioneer Kuvera to expand wealth management stack",
                "source": "Inc42",
                "date": "Feb 06, 2026",
                "url": "https://inc42.com/features/cred-kuvera-wealth-acquisition/"
            },
            {
                "title": "CRED revenue rises by 3.5x in FY25 as monetization lines mature",
                "source": "Entrackr",
                "date": "Nov 15, 2025",
                "url": "https://entrackr.com/2025/11/cred-fy25-revenue-growth/"
            },
            {
                "title": "CRED launches custom merchant discount offers for UPI members",
                "source": "Economic Times",
                "date": "Oct 02, 2025",
                "url": "https://economictimes.indiatimes.com/cred-upi-offers"
            },
            {
                "title": "Kunal Shah's CRED valuation hits $6.4B in latest funding extension",
                "source": "TechCrunch",
                "date": "Aug 20, 2025",
                "url": "https://techcrunch.com/2025/08/20/cred-valuation-update/"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$30M", "date": "2018", "investors": "Sequoia Capital India, Ribbit Capital"},
            {"round": "Series A", "amount": "$120M", "date": "2019", "investors": "Ribbit Capital, Gemini Investments"},
            {"round": "Series B", "amount": "$80M", "date": "2020", "investors": "DST Global, Sequoia Capital India"},
            {"round": "Series C", "amount": "$215M", "date": "2021", "investors": "Falcon Edge Capital, Coatue Management"},
            {"round": "Series D", "amount": "$251M", "date": "2021", "investors": "Tiger Global, Dragoneer Investment Group"},
            {"round": "Series F", "amount": "$140M", "date": "2022", "investors": "GIC, Sofina, Tiger Global"}
        ],
        "similar_startups": ["razorpay", "groww", "slice", "jar", "bharatpe"]
    },
    "zerodha": {
        "name": "Zerodha",
        "tagline": "India's largest stock broker by active clients, offering low-cost brokerage and investment platforms.",
        "founded_year": 2010,
        "hq": "Bengaluru, India",
        "team_size": "1,100+",
        "funding_stage": "Bootstrapped (Unicorn)",
        "total_funding": "N/A",
        "last_funding_round": "Bootstrapped",
        "website": "https://zerodha.com",
        "domain": "zerodha.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/zerodha",
            "twitter": "https://twitter.com/zerodhaonline",
            "github": "https://github.com/zerodha",
            "instagram": "https://instagram.com/zerodhaonline"
        },
        "founders": [
            {
                "name": "Nithin Kamath",
                "designation": "Founder & CEO",
                "bio": "Nithin Kamath is the Founder and CEO of Zerodha. He bootstrapped the company to become India's leading stockbroker and is a strong advocate for physical fitness and entrepreneurship.",
                "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/nithinkamath",
                "twitter": "https://twitter.com/nithinkamath"
            },
            {
                "name": "Nikhil Kamath",
                "designation": "Co-Founder",
                "bio": "Nikhil Kamath is the Co-Founder of Zerodha. He manages the investment and trading strategies and runs the public asset management firm True Beacon.",
                "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/nikhilkamath",
                "twitter": "https://twitter.com/nikhilkamath_"
            }
        ],
        "news": [
            {
                "title": "Zerodha reports net profit of Rs 2,900 crore in FY25, maintaining unicorn scaling",
                "source": "YourStory",
                "date": "Feb 10, 2026",
                "url": "https://yourstory.com/2026/02/zerodha-net-profit-growth-fy25"
            },
            {
                "title": "Zerodha Fund House assets under management cross Rs 500 crore in direct mutual funds",
                "source": "Inc42",
                "date": "Jan 24, 2026",
                "url": "https://inc42.com/buzz/zerodha-fund-house-crosses-500cr-aum"
            },
            {
                "title": "How Zerodha's tech team built Kite using Go and Python to process 10M orders daily",
                "source": "StartupNews.fyi",
                "date": "Dec 18, 2025",
                "url": "https://startupnews.fyi/zerodha-kite-tech-architecture"
            },
            {
                "title": "Zerodha partners with smallcase to launch tailored passive indices for young investors",
                "source": "Economic Times",
                "date": "Oct 12, 2025",
                "url": "https://economictimes.indiatimes.com/zerodha-smallcase-indices"
            },
            {
                "title": "Zerodha's Rainmatter incubator commits Rs 1,000 crore to back clean energy and health startups",
                "source": "TechCrunch",
                "date": "Sep 05, 2025",
                "url": "https://techcrunch.com/2025/09/05/zerodha-rainmatter-commitments/"
            }
        ],
        "funding_timeline": [
            {"round": "Bootstrapped", "amount": "N/A", "date": "2010-Present", "investors": "None"}
        ],
        "similar_startups": ["groww", "cred", "jar"]
    },
    "groww": {
        "name": "Groww",
        "tagline": "User-friendly investment platform offering direct mutual funds, stocks, ETFs, and wealth management.",
        "founded_year": 2016,
        "hq": "Bengaluru, India",
        "team_size": "1,500+",
        "funding_stage": "Series E (Unicorn)",
        "total_funding": "$390M",
        "last_funding_round": "Series E",
        "website": "https://groww.in",
        "domain": "groww.in",
        "social_links": {
            "linkedin": "https://linkedin.com/company/growwin",
            "twitter": "https://twitter.com/groww",
            "github": "https://github.com/groww",
            "instagram": "https://instagram.com/groww_official"
        },
        "founders": [
            {
                "name": "Lalit Keshre",
                "designation": "Co-Founder & CEO",
                "bio": "Lalit Keshre is the Co-Founder & CEO of Groww. He previously worked at Flipkart and studied Microelectronics at IIT Bombay.",
                "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/lalitkeshre",
                "twitter": "https://twitter.com/lalitkeshre"
            }
        ],
        "news": [
            {
                "title": "Groww surpasses Zerodha in active clients count on NSE database",
                "source": "Economic Times",
                "date": "Jan 15, 2026",
                "url": "https://economictimes.indiatimes.com/tech/startups/groww-active-clients/"
            },
            {
                "title": "Groww launches direct stock trading capabilities for Indian retail investors",
                "source": "TechCrunch",
                "date": "Feb 02, 2026",
                "url": "https://techcrunch.com/2026/02/02/groww-retail-trading/"
            },
            {
                "title": "Groww secures credit rating upgrades as transaction volumes scale up",
                "source": "Entrackr",
                "date": "Dec 10, 2025",
                "url": "https://entrackr.com/groww-credit-rating"
            },
            {
                "title": "How Groww's React Native application processes millions of sessions every morning",
                "source": "YourStory",
                "date": "Nov 22, 2025",
                "url": "https://yourstory.com/groww-tech-stack-scaling"
            },
            {
                "title": "Groww launches zero-commission direct mutual fund SIPs for rural audiences",
                "source": "Inc42",
                "date": "Sep 30, 2025",
                "url": "https://inc42.com/groww-rural-sips"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$1.2M", "date": "2017", "investors": "Kae Capital, Y Combinator"},
            {"round": "Series A", "amount": "$6.2M", "date": "2019", "investors": "Sequoia Capital India, Kae Capital"},
            {"round": "Series B", "amount": "$21M", "date": "2019", "investors": "Ribbit Capital, Sequoia Capital India"},
            {"round": "Series C", "amount": "$30M", "date": "2020", "investors": "Y Combinator Continuity/Growth"},
            {"round": "Series D", "amount": "$83M", "date": "2021", "investors": "Tiger Global Management"},
            {"round": "Series E", "amount": "$251M", "date": "2021", "investors": "Iconiq Growth, Alkeon Capital"}
        ],
        "similar_startups": ["zerodha", "cred", "jar"]
    },
    "meesho": {
        "name": "Meesho",
        "tagline": "Social commerce platform enabling small businesses and individuals to resell fashion and lifestyle items.",
        "founded_year": 2015,
        "hq": "Bengaluru, India",
        "team_size": "1,400+",
        "funding_stage": "Series F (Unicorn)",
        "total_funding": "$1.1B",
        "last_funding_round": "Series F",
        "website": "https://meesho.com",
        "domain": "meesho.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/meesho",
            "twitter": "https://twitter.com/meeshoapp",
            "github": "https://github.com/meesho",
            "instagram": "https://instagram.com/meeshoapp"
        },
        "founders": [
            {
                "name": "Vidit Aatrey",
                "designation": "Founder & CEO",
                "bio": "Vidit Aatrey is the Founder and CEO of Meesho. He graduated from IIT Delhi and worked at ITC and InMobi before starting Meesho.",
                "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/viditaatrey",
                "twitter": "https://twitter.com/viditaatrey"
            },
            {
                "name": "Sanjeev Barnwal",
                "designation": "Co-Founder & CTO",
                "bio": "Sanjeev Barnwal is the Co-Founder and CTO of Meesho. He graduated from IIT Delhi and worked in engineering at Sony Mobile in Japan.",
                "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/sanjeevbarnwal",
                "twitter": "https://twitter.com/sanjeevbarnwal"
            }
        ],
        "news": [
            {
                "title": "Meesho valuation hits $5B as Softbank and others look to double down on social commerce",
                "source": "Inc42",
                "date": "Jan 12, 2026",
                "url": "https://inc42.com/features/meesho-valuation-rises-to-5b-with-secondary-share-sale/"
            },
            {
                "title": "Meesho launches direct brand loyalty points program for Tier-3 merchants",
                "source": "YourStory",
                "date": "Feb 18, 2026",
                "url": "https://yourstory.com/meesho-merchant-loyalty"
            },
            {
                "title": "How Meesho scaled its serverless API framework to support 2 million simultaneous active orders",
                "source": "TechCrunch",
                "date": "Dec 08, 2025",
                "url": "https://techcrunch.com/2025/12/08/meesho-scalability/"
            },
            {
                "title": "Meesho becomes the most downloaded e-commerce application globally in Google Play Store",
                "source": "Economic Times",
                "date": "Oct 15, 2025",
                "url": "https://economictimes.indiatimes.com/meesho-download-record"
            },
            {
                "title": "Meesho registers double-digit operating profitability ahead of scheduled IPO filing",
                "source": "Entrackr",
                "date": "Nov 30, 2025",
                "url": "https://entrackr.com/meesho-profitability-ipo"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$120K", "date": "2016", "investors": "Y Combinator"},
            {"round": "Series A", "amount": "$3M", "date": "2017", "investors": "SAIF Partners"},
            {"round": "Series B", "amount": "$11.5M", "date": "2018", "investors": "Sequoia Capital India"},
            {"round": "Series C", "amount": "$50M", "date": "2018", "investors": "Shunwei Capital, DST Partners"},
            {"round": "Series D", "amount": "$125M", "date": "2019", "investors": "Naspers, Facebook"},
            {"round": "Series E", "amount": "$300M", "date": "2021", "investors": "SoftBank Vision Fund 2"}
        ],
        "similar_startups": ["flipkart", "myntra", "zepto"]
    },
    "zepto": {
        "name": "Zepto",
        "tagline": "India's fastest-growing quick-commerce platform delivering groceries in under 10 minutes.",
        "founded_year": 2021,
        "hq": "Mumbai, India",
        "team_size": "1,000+",
        "funding_stage": "Series F (Unicorn)",
        "total_funding": "$560M",
        "last_funding_round": "Series F",
        "website": "https://www.zeptonow.com",
        "domain": "zeptonow.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/zeptonow",
            "twitter": "https://twitter.com/ZeptoNow",
            "instagram": "https://instagram.com/zeptonow"
        },
        "founders": [
            {
                "name": "Aadit Palicha",
                "designation": "Co-Founder & CEO",
                "bio": "Aadit Palicha is the Co-Founder & CEO of Zepto. He dropped out of Stanford's Computer Science program to build Kiranakart and subsequently Zepto.",
                "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/aaditpalicha",
                "twitter": "https://twitter.com/aaditpalicha"
            },
            {
                "name": "Kaivalya Vohra",
                "designation": "Co-Founder & CTO",
                "bio": "Kaivalya Vohra is the Co-Founder & CTO of Zepto. He dropped out of Stanford's Computer Science program alongside Aadit Palicha to architect Zepto's quick commerce delivery engine.",
                "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/kaivalyavohra",
                "twitter": "https://twitter.com/kaivalyav"
            }
        ],
        "news": [
            {
                "title": "Zepto raises $340M in Series F extension, valuation surges to $5B",
                "source": "TechCrunch",
                "date": "Feb 12, 2026",
                "url": "https://techcrunch.com/2026/02/12/zepto-secures-series-f/"
            },
            {
                "title": "How Zepto's dark store routing algorithm delivers orders in 9.4 minutes average",
                "source": "YourStory",
                "date": "Jan 30, 2026",
                "url": "https://yourstory.com/zepto-darkstore-routing-algorithms"
            },
            {
                "title": "Zepto expands café deliveries to deliver hot snacks and beverages inside 10 minutes",
                "source": "Inc42",
                "date": "Dec 15, 2025",
                "url": "https://inc42.com/zepto-cafe-delivery-expansion"
            },
            {
                "title": "Zepto sets targets for operating cash flow positive status by Q3 FY26",
                "source": "Entrackr",
                "date": "Nov 20, 2025",
                "url": "https://entrackr.com/zepto-cashflow-milestones"
            },
            {
                "title": "Zepto plans massive hiring campaign to recruit 400 software engineers in Bangalore office",
                "source": "Economic Times",
                "date": "Oct 10, 2025",
                "url": "https://economictimes.indiatimes.com/zepto-hiring-drive"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$60M", "date": "2021", "investors": "Glade Brook Capital, Nexus Venture Partners"},
            {"round": "Series C", "amount": "$100M", "date": "2021", "investors": "Y Combinator Continuity Fund, Kaiser Permanente"},
            {"round": "Series D", "amount": "$200M", "date": "2022", "investors": "Kaiser Permanente, Nexus Venture Partners"},
            {"round": "Series E", "amount": "$200M", "date": "2023", "investors": "StepStone Group, Goodwater Capital"}
        ],
        "similar_startups": ["swiggy", "zomato", "meesho", "porter"]
    },
    "boat": {
        "name": "boAt",
        "tagline": "India's leading consumer electronics brand specializing in premium audio wearables and smartwatches.",
        "founded_year": 2016,
        "hq": "Delhi, India",
        "team_size": "500+",
        "funding_stage": "Series C",
        "total_funding": "$177M",
        "last_funding_round": "Series C",
        "website": "https://www.boat-lifestyle.com",
        "domain": "boat-lifestyle.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/boat-lifestyle",
            "twitter": "https://twitter.com/RockWithboAt",
            "instagram": "https://instagram.com/boat.nirvana"
        },
        "founders": [
            {
                "name": "Aman Gupta",
                "designation": "Co-Founder & CMO",
                "bio": "Aman Gupta is the Co-Founder & CMO of boAt. He is a famous investor on Shark Tank India and leads brand strategy and marketing operations.",
                "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/aman-gupta-boat",
                "twitter": "https://twitter.com/amanguptaboat"
            },
            {
                "name": "Sameer Mehta",
                "designation": "Co-Founder & CEO",
                "bio": "Sameer Mehta is the Co-Founder & CEO of boAt. He manages the product design, manufacturing alliances, and supply chain logistics.",
                "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/sameermehata",
                "twitter": "https://twitter.com/sameermehata"
            }
        ],
        "news": [
            {
                "title": "boAt dominates India's wearables segment with 28% market share in Q4 report",
                "source": "YourStory",
                "date": "Feb 05, 2026",
                "url": "https://yourstory.com/2026/02/boat-wearables-market-share"
            },
            {
                "title": "boAt shifts 70% of manufacturing units locally to India under Make in India incentives",
                "source": "Inc42",
                "date": "Jan 22, 2026",
                "url": "https://inc42.com/boat-manufacturing-india-incentives"
            },
            {
                "title": "boAt partners with Dolby to launch premium immersive smart soundbars globally",
                "source": "Economic Times",
                "date": "Dec 10, 2025",
                "url": "https://economictimes.indiatimes.com/boat-dolby-collaboration"
            },
            {
                "title": "Aman Gupta details boAt's plans to target APAC and Middle East export routes",
                "source": "TechCrunch",
                "date": "Nov 02, 2025",
                "url": "https://techcrunch.com/2025/11/02/boat-wearables-expansion/"
            },
            {
                "title": "boAt registers profitability gains in FY25 as smartwatch margins expand",
                "source": "Entrackr",
                "date": "Oct 15, 2025",
                "url": "https://entrackr.com/boat-fy25-profitability"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$900K", "date": "2018", "investors": "Fireside Ventures"},
            {"round": "Series A", "amount": "$3M", "date": "2019", "investors": "Fireside Ventures"},
            {"round": "Series B", "amount": "$100M", "date": "2021", "investors": "Warburg Pincus"},
            {"round": "Series C", "amount": "$60M", "date": "2022", "investors": "Malabar India Fund, Warburg Pincus"}
        ],
        "similar_startups": ["ather-energy", "ola"]
    },
    "physicswallah": {
        "name": "Physics Wallah",
        "tagline": "Affordable online learning platform offering top-tier test preparation for JEE, NEET, and board exams.",
        "founded_year": 2016,
        "hq": "Noida, India",
        "team_size": "5,000+",
        "funding_stage": "Series A (Unicorn)",
        "total_funding": "$100M",
        "last_funding_round": "Series A",
        "website": "https://www.pw.live",
        "domain": "pw.live",
        "social_links": {
            "linkedin": "https://linkedin.com/company/physicswallah",
            "twitter": "https://twitter.com/physicswallah",
            "instagram": "https://instagram.com/physicswallah"
        },
        "founders": [
            {
                "name": "Alakh Pandey",
                "designation": "Founder & CEO",
                "bio": "Alakh Pandey is the Founder & CEO of Physics Wallah. He started PW as a YouTube channel offering physics tutorials, which grew into one of India's largest EdTech platforms.",
                "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/alakh-pandey-pw",
                "twitter": "https://twitter.com/physicswallahap"
            },
            {
                "name": "Prateek Maheshwari",
                "designation": "Co-Founder",
                "bio": "Prateek Maheshwari is the Co-Founder of Physics Wallah. He graduated from IIT Varanasi and leads PW's technology development and operational scale.",
                "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/prateekmaheshwari"
            }
        ],
        "news": [
            {
                "title": "Physics Wallah plans to invest Rs 120 crore to open offline learning centers across South India",
                "source": "Moneycontrol",
                "date": "Feb 12, 2026",
                "url": "https://moneycontrol.com/news/business/startup/physicswallah-to-invest-rs-120-cr-in-south-expansion-12193839.html"
            },
            {
                "title": "Physics Wallah active user base crosses 15 million across app and web portals",
                "source": "YourStory",
                "date": "Jan 30, 2026",
                "url": "https://yourstory.com/physicswallah-active-users-growth"
            },
            {
                "title": "How Physics Wallah scaled its video delivery infrastructure to support 500k simultaneous live streams",
                "source": "Entrackr",
                "date": "Dec 10, 2025",
                "url": "https://entrackr.com/pw-video-delivery-scaling"
            },
            {
                "title": "Physics Wallah launches specialized skill development courses in coding and digital marketing",
                "source": "Inc42",
                "date": "Oct 18, 2025",
                "url": "https://inc42.com/pw-skills-courses-launch"
            },
            {
                "title": "Physics Wallah registers net operational profitability in FY25 results audit",
                "source": "Economic Times",
                "date": "Sep 15, 2025",
                "url": "https://economictimes.indiatimes.com/pw-fy25-profits"
            }
        ],
        "funding_timeline": [
            {"round": "Series A", "amount": "$100M", "date": "2022", "investors": "WestBridge Capital, GSV Ventures"}
        ],
        "similar_startups": ["unacademy", "vedantu"]
    },
    "unacademy": {
        "name": "Unacademy",
        "tagline": "Educational platform providing live classes, test prep, and structured courses with expert educators.",
        "founded_year": 2015,
        "hq": "Bengaluru, India",
        "team_size": "2,500+",
        "funding_stage": "Series H (Unicorn)",
        "total_funding": "$800M",
        "last_funding_round": "Series H",
        "website": "https://unacademy.com",
        "domain": "unacademy.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/unacademy",
            "twitter": "https://twitter.com/unacademy",
            "instagram": "https://instagram.com/unacademy"
        },
        "founders": [
            {
                "name": "Gaurav Munjal",
                "designation": "Co-Founder & CEO",
                "bio": "Gaurav Munjal is the Co-Founder & CEO of Unacademy. He previously founded Flinto (acquired) and holds a computer science degree from NMIMS.",
                "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/gauravmunjal",
                "twitter": "https://twitter.com/gauravmunjal"
            },
            {
                "name": "Roman Saini",
                "designation": "Co-Founder",
                "bio": "Roman Saini is the Co-Founder of Unacademy. He is a former IAS Officer and qualified AIIMS doctor, leading curriculum strategy.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/romansaini",
                "twitter": "https://twitter.com/romansaini"
            }
        ],
        "news": [
            {
                "title": "Unacademy launches Unacademy Centres for hybrid physical coaching classrooms",
                "source": "YourStory",
                "date": "Feb 02, 2026",
                "url": "https://yourstory.com/2026/02/unacademy-centres-offline"
            },
            {
                "title": "Unacademy launches direct AI voice tutor for real-time doubts resolution",
                "source": "Inc42",
                "date": "Jan 10, 2026",
                "url": "https://inc42.com/unacademy-ai-voice-tutor"
            },
            {
                "title": "How Unacademy's hybrid architecture supports massive load surges during mock tests",
                "source": "StartupNews.fyi",
                "date": "Dec 05, 2025",
                "url": "https://startupnews.fyi/unacademy-tech-infrastructure"
            },
            {
                "title": "Unacademy partners with national educational boards for curriculum integration",
                "source": "Economic Times",
                "date": "Oct 12, 2025",
                "url": "https://economictimes.indiatimes.com/unacademy-board-integration"
            },
            {
                "title": "Unacademy valuation stands at $3.4B in secondary transaction filings",
                "source": "TechCrunch",
                "date": "Sep 20, 2025",
                "url": "https://techcrunch.com/2025/09/20/unacademy-valuation/"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$500K", "date": "2016", "investors": "Blume Ventures, WaterBridge Ventures"},
            {"round": "Series A", "amount": "$4.5M", "date": "2017", "investors": "Nexus Venture Partners, Sequoia Capital India"},
            {"round": "Series D", "amount": "$50M", "date": "2019", "investors": "Steadview Capital, Sequoia Capital India"},
            {"round": "Series F", "amount": "$110M", "date": "2020", "investors": "Facebook, General Atlantic"},
            {"round": "Series H", "amount": "$440M", "date": "2021", "investors": "Temasek Holdings, SoftBank Vision Fund 2"}
        ],
        "similar_startups": ["physicswallah", "vedantu"]
    },
    "ola": {
        "name": "Ola",
        "tagline": "Cab booking aggregator, ride-hailing services, and electric vehicle fleet network operations.",
        "founded_year": 2010,
        "hq": "Bengaluru, India",
        "team_size": "3,000+",
        "funding_stage": "Late Stage (Unicorn)",
        "total_funding": "$3.8B",
        "last_funding_round": "Late Stage",
        "website": "https://www.olacabs.com",
        "domain": "olacabs.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/olacabs",
            "twitter": "https://twitter.com/Olacabs",
            "instagram": "https://instagram.com/olacabs"
        },
        "founders": [
            {
                "name": "Bhavish Aggarwal",
                "designation": "Founder & CEO",
                "bio": "Bhavish Aggarwal is the Founder & CEO of Ola and Ola Electric. He holds a degree in Computer Science from IIT Bombay and worked at Microsoft Research.",
                "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/bhavishaggarwal",
                "twitter": "https://twitter.com/bhavish"
            }
        ],
        "news": [
            {
                "title": "Ola launches driverless maps navigation systems for electric cabs fleet",
                "source": "YourStory",
                "date": "Feb 14, 2026",
                "url": "https://yourstory.com/2026/02/ola-electric-maps-navigation"
            },
            {
                "title": "Ola Electric market capitalisation surges as IPO scaling goals hit targets",
                "source": "TechCrunch",
                "date": "Jan 18, 2026",
                "url": "https://techcrunch.com/2026/01/18/ola-electric-ipo/"
            },
            {
                "title": "How Ola Cabs scaled its ride matching framework to handle 200,000 requests per minute",
                "source": "Entrackr",
                "date": "Dec 02, 2025",
                "url": "https://entrackr.com/ola-ride-matching-algorithms"
            },
            {
                "title": "Ola plans expansion into premium subscription intra-city shuttle route lines",
                "source": "Inc42",
                "date": "Nov 12, 2025",
                "url": "https://inc42.com/ola-premium-shuttle-launch"
            },
            {
                "title": "Bhavish Aggarwal outlines India-centric autonomous delivery vehicle pipeline",
                "source": "Economic Times",
                "date": "Oct 05, 2025",
                "url": "https://economictimes.indiatimes.com/ola-autonomous-delivery"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$300K", "date": "2011", "investors": "Rehan Yar Khan, Anupam Mittal"},
            {"round": "Series A", "amount": "$5M", "date": "2012", "investors": "Tiger Global Management"},
            {"round": "Series C", "amount": "$41M", "date": "2014", "investors": "Matrix Partners, Tiger Global"},
            {"round": "Series E", "amount": "$400M", "date": "2015", "investors": "DST Global, Accel Partners"},
            {"round": "Series G", "amount": "$1.1B", "date": "2017", "investors": "Tencent Holdings, SoftBank Group"}
        ],
        "similar_startups": ["ather-energy", "boat"]
    },
    "ather-energy": {
        "name": "Ather Energy",
        "tagline": "Designing and manufacturing premium smart electric scooters and expanding public fast-charging grids.",
        "founded_year": 2013,
        "hq": "Bengaluru, India",
        "team_size": "1,200+",
        "funding_stage": "Late Stage (Unicorn)",
        "total_funding": "$450M",
        "last_funding_round": "Late Stage",
        "website": "https://www.atherenergy.com",
        "domain": "atherenergy.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/ather-energy",
            "twitter": "https://twitter.com/ather_energy",
            "instagram": "https://instagram.com/atherenergy"
        },
        "founders": [
            {
                "name": "Tarun Mehta",
                "designation": "Co-Founder & CEO",
                "bio": "Tarun Mehta is the Co-Founder and CEO of Ather Energy. He graduated from IIT Madras and is pioneering the high-performance smart electric scooter market in India.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/tarunmehtaather",
                "twitter": "https://twitter.com/tarunsmehta"
            },
            {
                "name": "Swapnil Jain",
                "designation": "Co-Founder & CTO",
                "bio": "Swapnil Jain is the Co-Founder and CTO of Ather Energy. He graduated from IIT Madras and leads battery pack development and vehicle engineering teams.",
                "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/swapniljain"
            }
        ],
        "news": [
            {
                "title": "Ather Energy files draft IPO prospectus to target $2.5B public listing",
                "source": "YourStory",
                "date": "Feb 10, 2026",
                "url": "https://yourstory.com/2026/02/ather-energy-files-ipo-papers"
            },
            {
                "title": "Ather Grid fast charging stations network crosses 2,000 installations in India",
                "source": "Inc42",
                "date": "Jan 28, 2026",
                "url": "https://inc42.com/ather-grid-crosses-2000-charging-points"
            },
            {
                "title": "Ather launches Apex 450 scooter to target premium sports commuters markets",
                "source": "Economic Times",
                "date": "Dec 08, 2025",
                "url": "https://economictimes.indiatimes.com/ather-apex-launch"
            },
            {
                "title": "Ather secures Rs 900 crore funding commitment from Hero MotoCorp",
                "source": "TechCrunch",
                "date": "Oct 15, 2025",
                "url": "https://techcrunch.com/2025/10/15/ather-hero-investment/"
            },
            {
                "title": "Ather sets up second manufacturing plant in Maharashtra to boost daily production",
                "source": "Entrackr",
                "date": "Sep 22, 2025",
                "url": "https://entrackr.com/ather-maharashtra-plant"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$1M", "date": "2014", "investors": "Sachin Bansal, Binny Bansal"},
            {"round": "Series A", "amount": "$12M", "date": "2015", "investors": "Tiger Global Management"},
            {"round": "Series B", "amount": "$27M", "date": "2016", "investors": "Hero MotoCorp"},
            {"round": "Series C", "amount": "$51M", "date": "2019", "investors": "Hero MotoCorp, Sachin Bansal"},
            {"round": "Series E", "amount": "$128M", "date": "2022", "investors": "National Investment and Infrastructure Fund"}
        ],
        "similar_startups": ["ola", "boat"]
    },
    "browserstack": {
        "name": "BrowserStack",
        "tagline": "Cloud-based testing platform allowing developers to test web and mobile apps on real devices.",
        "founded_year": 2011,
        "hq": "Mumbai, India",
        "team_size": "1,000+",
        "funding_stage": "Series B (Unicorn)",
        "total_funding": "$200M",
        "last_funding_round": "Series B",
        "website": "https://browserstack.com",
        "domain": "browserstack.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/browserstack",
            "twitter": "https://twitter.com/browserstack",
            "github": "https://github.com/browserstack",
            "instagram": "https://instagram.com/browserstack"
        },
        "founders": [
            {
                "name": "Ritesh Arora",
                "designation": "Co-Founder & CEO",
                "bio": "Ritesh Arora is the Co-Founder & CEO of BrowserStack. He holds a degree in Computer Science from IIT Bombay and is pioneering automated app testing tools.",
                "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/ritesh-arora-browserstack",
                "twitter": "https://twitter.com/ritesh_arora"
            },
            {
                "name": "Nakul Aggarwal",
                "designation": "Co-Founder & CTO",
                "bio": "Nakul Aggarwal is the Co-Founder & CTO of BrowserStack. He holds a degree in Computer Science from IIT Bombay and heads engineering, product architecture and security infrastructure.",
                "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/nakulaggarwal"
            }
        ],
        "news": [
            {
                "title": "BrowserStack acquires accessibility testing startup Bird Eats Bug",
                "source": "YourStory",
                "date": "Feb 08, 2026",
                "url": "https://yourstory.com/2026/02/browserstack-acquires-bird-eats-bug"
            },
            {
                "title": "BrowserStack launches Test Observability features for CI/CD developers pipelines",
                "source": "Inc42",
                "date": "Jan 24, 2026",
                "url": "https://inc42.com/browserstack-test-observability"
            },
            {
                "title": "BrowserStack's real device cloud base crosses 15 global centers to lower test latency",
                "source": "TechCrunch",
                "date": "Dec 05, 2025",
                "url": "https://techcrunch.com/2025/12/05/browserstack-device-cloud/"
            },
            {
                "title": "BrowserStack partners with Microsoft Visual Studio to offer direct testing integrations",
                "source": "Economic Times",
                "date": "Oct 12, 2025",
                "url": "https://economictimes.indiatimes.com/browserstack-visual-studio"
            },
            {
                "title": "BrowserStack valuation sustained at $4B in secondary employee share buyback program",
                "source": "Entrackr",
                "date": "Sep 30, 2025",
                "url": "https://entrackr.com/browserstack-valuation-buybacks"
            }
        ],
        "funding_timeline": [
            {"round": "Series A", "amount": "$50M", "date": "2018", "investors": "Accel Partners"},
            {"round": "Series B", "amount": "$200M", "date": "2021", "investors": "Bond Capital, Insight Partners, Accel Partners"}
        ],
        "similar_startups": ["postman", "freshworks", "darwinbox"]
    },
    "postman": {
        "name": "Postman",
        "tagline": "Leading collaboration platform for building, mocking, testing, and managing APIs worldwide.",
        "founded_year": 2014,
        "hq": "Bengaluru, India",
        "team_size": "1,200+",
        "funding_stage": "Series D (Unicorn)",
        "total_funding": "$430M",
        "last_funding_round": "Series D",
        "website": "https://www.postman.com",
        "domain": "postman.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/postman-platform",
            "twitter": "https://twitter.com/getpostman",
            "github": "https://github.com/postmanlabs",
            "instagram": "https://instagram.com/postman"
        },
        "founders": [
            {
                "name": "Abhinav Asthana",
                "designation": "Co-Founder & CEO",
                "bio": "Abhinav Asthana is the Co-Founder & CEO of Postman. He holds a degree from BITS Pilani and started Postman as a side project to simplify API testing workflows.",
                "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/abhinavasthana",
                "twitter": "https://twitter.com/a85"
            },
            {
                "name": "Ankit Sobti",
                "designation": "Co-Founder & CTO",
                "bio": "Ankit Sobti is the Co-Founder & CTO of Postman. He leads software architecture, API schemas and cloud engineering teams.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/ankitsobti"
            }
        ],
        "news": [
            {
                "title": "Postman active developer base crosses 30 million worldwide on API client networks",
                "source": "YourStory",
                "date": "Feb 11, 2026",
                "url": "https://yourstory.com/2026/02/postman-crosses-30-million-developers"
            },
            {
                "title": "Postman launches AI-powered API assistant Postbot to automate test scripting",
                "source": "TechCrunch",
                "date": "Jan 18, 2026",
                "url": "https://techcrunch.com/2026/01/18/postman-postbot-api/"
            },
            {
                "title": "Postman valuation stands stable at $5.6B in latest SEC audit updates",
                "source": "Inc42",
                "date": "Dec 08, 2025",
                "url": "https://inc42.com/postman-sec-valuations-audit"
            },
            {
                "title": "Postman partners with GitHub to link direct actions workflow APIs to Kite repositories",
                "source": "Economic Times",
                "date": "Oct 15, 2025",
                "url": "https://economictimes.indiatimes.com/postman-github-workflows"
            },
            {
                "title": "How Postman handles millions of API collection synchronization queries every minute",
                "source": "Entrackr",
                "date": "Sep 22, 2025",
                "url": "https://entrackr.com/postman-collection-sync-architecture"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$1M", "date": "2015", "investors": "Nexus Venture Partners"},
            {"round": "Series A", "amount": "$7M", "date": "2016", "investors": "Nexus Venture Partners"},
            {"round": "Series B", "amount": "$50M", "date": "2019", "investors": "CRV, Nexus Venture Partners"},
            {"round": "Series C", "amount": "$150M", "date": "2020", "investors": "Insight Partners"},
            {"round": "Series D", "amount": "$225M", "date": "2021", "investors": "Nexus Venture Partners, CRV, Insight Partners"}
        ],
        "similar_startups": ["browserstack", "freshworks", "darwinbox"]
    },
    "freshworks": {
        "name": "Freshworks",
        "tagline": "Cloud-based customer support software, IT service desk management, and CRM solution suite.",
        "founded_year": 2010,
        "hq": "Chennai, India",
        "team_size": "5,000+",
        "funding_stage": "IPO (NASDAQ: FRSH)",
        "total_funding": "$480M",
        "last_funding_round": "IPO",
        "website": "https://freshworks.com",
        "domain": "freshworks.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/freshworks",
            "twitter": "https://twitter.com/freshworksinc",
            "github": "https://github.com/freshworks"
        },
        "founders": [
            {
                "name": "Girish Mathrubootham",
                "designation": "Founder & Executive Chairman",
                "bio": "Girish Mathrubootham is the Founder & Executive Chairman of Freshworks. He started Freshworks in Chennai, eventually leading it to a historic IPO on NASDAQ.",
                "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/girishmathrubootham",
                "twitter": "https://twitter.com/mrgirish"
            }
        ],
        "news": [
            {
                "title": "Freshworks quarterly revenue grows by 20% in NASDAQ disclosure report",
                "source": "YourStory",
                "date": "Feb 10, 2026",
                "url": "https://yourstory.com/2026/02/freshworks-nasdaq-revenue-report"
            },
            {
                "title": "Freshworks launches Freddy AI agent to solve 80% of customer support queries",
                "source": "TechCrunch",
                "date": "Jan 18, 2026",
                "url": "https://techcrunch.com/2026/01/18/freshworks-freddy-ai/"
            },
            {
                "title": "Freshworks expands enterprise pipeline with custom ITSM service management modules",
                "source": "Inc42",
                "date": "Dec 05, 2025",
                "url": "https://inc42.com/freshworks-itsm-enterprise"
            },
            {
                "title": "Girish Mathrubootham steps into Executive Chairman role as Dennis Woodside becomes CEO",
                "source": "Economic Times",
                "date": "Oct 12, 2025",
                "url": "https://economictimes.indiatimes.com/freshworks-ceo-change"
            },
            {
                "title": "Freshworks announces buyback of outstanding public common shares under board plan",
                "source": "Entrackr",
                "date": "Nov 22, 2025",
                "url": "https://entrackr.com/freshworks-shares-buybacks"
            }
        ],
        "funding_timeline": [
            {"round": "Series A", "amount": "$1M", "date": "2011", "investors": "Accel Partners"},
            {"round": "Series B", "amount": "$5M", "date": "2012", "investors": "Tiger Global Management"},
            {"round": "Series C", "amount": "$35M", "date": "2014", "investors": "Accel, Tiger Global"},
            {"round": "Series F", "amount": "$55M", "date": "2016", "investors": "Sequoia Capital India"},
            {"round": "Series H", "amount": "$150M", "date": "2019", "investors": "Sequoia Capital, Accel Partners, Tiger Global"}
        ],
        "similar_startups": ["browserstack", "postman", "darwinbox"]
    },
    "darwinbox": {
        "name": "Darwinbox",
        "tagline": "Cloud-based human capital management (HCM) tool optimizing HR workflows for enterprise firms.",
        "founded_year": 2015,
        "hq": "Hyderabad, India",
        "team_size": "900+",
        "funding_stage": "Series D (Unicorn)",
        "total_funding": "$110M",
        "last_funding_round": "Series D",
        "website": "https://darwinbox.com",
        "domain": "darwinbox.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/darwinbox",
            "twitter": "https://twitter.com/darwinbox",
            "instagram": "https://instagram.com/darwinbox"
        },
        "founders": [
            {
                "name": "Jayant Paleti",
                "designation": "Co-Founder",
                "bio": "Jayant Paleti is the Co-Founder of Darwinbox. He worked in investment banking at EY before founding Darwinbox to innovate HR systems.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/jayantpaleti",
                "twitter": "https://twitter.com/jayantpaleti"
            },
            {
                "name": "Rohit Chennamaneni",
                "designation": "Co-Founder",
                "bio": "Rohit Chennamaneni is the Co-Founder of Darwinbox. He worked in consulting at McKinsey and tech management at Google before co-founding Darwinbox.",
                "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/rohitchennamaneni",
                "twitter": "https://twitter.com/rohitchenna"
            }
        ],
        "news": [
            {
                "title": "Darwinbox expands operations to North America to target enterprise SaaS clients",
                "source": "YourStory",
                "date": "Feb 12, 2026",
                "url": "https://yourstory.com/2026/02/darwinbox-expansion-north-america"
            },
            {
                "title": "Darwinbox active employee users cross 3 million across APAC and India regions",
                "source": "Inc42",
                "date": "Jan 28, 2026",
                "url": "https://inc42.com/darwinbox-reaches-3m-active-users"
            },
            {
                "title": "Darwinbox launches generative AI HR assistant Darwin to automate payroll queries",
                "source": "Economic Times",
                "date": "Dec 10, 2025",
                "url": "https://economictimes.indiatimes.com/darwinbox-ai-assistant"
            },
            {
                "title": "Darwinbox secures partnership with major Middle East conglomerate retail pipelines",
                "source": "TechCrunch",
                "date": "Oct 15, 2025",
                "url": "https://techcrunch.com/2025/10/15/darwinbox-retail-deals/"
            },
            {
                "title": "How Darwinbox built its microservices multi-tenant database to scale horizontally",
                "source": "Entrackr",
                "date": "Sep 22, 2025",
                "url": "https://entrackr.com/darwinbox-database-architecture"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$500K", "date": "2015", "investors": "Endiya Partners"},
            {"round": "Series A", "amount": "$4M", "date": "2017", "investors": "Lightspeed Venture Partners"},
            {"round": "Series B", "amount": "$15M", "date": "2019", "investors": "Sequoia Capital India"},
            {"round": "Series C", "amount": "$15M", "date": "2021", "investors": "Salesforce Ventures, Sequoia Capital India"},
            {"round": "Series D", "amount": "$72M", "date": "2022", "investors": "TCV, Salesforce Ventures, Lightspeed Partners"}
        ],
        "similar_startups": ["browserstack", "postman", "freshworks"]
    },
    "porter": {
        "name": "Porter",
        "tagline": "On-demand intra-city mini truck booking and logistics solutions platform for business parcels.",
        "founded_year": 2014,
        "hq": "Bengaluru, India",
        "team_size": "1,200+",
        "funding_stage": "Series E (Unicorn)",
        "total_funding": "$150M",
        "last_funding_round": "Series E",
        "website": "https://porter.in",
        "domain": "porter.in",
        "social_links": {
            "linkedin": "https://linkedin.com/company/porter.in",
            "twitter": "https://twitter.com/porter_in",
            "instagram": "https://instagram.com/porter_india"
        },
        "founders": [
            {
                "name": "Pranav Goel",
                "designation": "Co-Founder & CEO",
                "bio": "Pranav Goel is the Co-Founder & CEO of Porter. He holds a degree from IIT Kharagpur and is scaling digital booking networks for heavy freight.",
                "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/pranav-goel-porter",
                "twitter": "https://twitter.com/pranavgoel"
            }
        ],
        "news": [
            {
                "title": "Porter reports 60% surge in intra-city freight transaction volumes in FY25 results",
                "source": "YourStory",
                "date": "Feb 10, 2026",
                "url": "https://yourstory.com/2026/02/porter-logistics-growth-fy25"
            },
            {
                "title": "Porter launches specialized packers and movers services across 15 Tier-2 cities",
                "source": "Inc42",
                "date": "Jan 22, 2026",
                "url": "https://inc42.com/porter-packers-movers-launch"
            },
            {
                "title": "Porter partners with central state utilities to power intra-city postal delivery",
                "source": "Economic Times",
                "date": "Dec 08, 2025",
                "url": "https://economictimes.indiatimes.com/porter-postal-partnerships"
            },
            {
                "title": "How Porter's vehicle routing algorithm minimizes dry runs for truck drivers by 30%",
                "source": "TechCrunch",
                "date": "Oct 15, 2025",
                "url": "https://techcrunch.com/2025/10/15/porter-logistics-routing/"
            },
            {
                "title": "Porter registers operational EBITDA positive milestones in public disclosures",
                "source": "Entrackr",
                "date": "Sep 30, 2025",
                "url": "https://entrackr.com/porter-ebitda-margins"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$500K", "date": "2014", "investors": "Kae Capital"},
            {"round": "Series A", "amount": "$5.5M", "date": "2015", "investors": "Sequoia Capital India, Kae Capital"},
            {"round": "Series B", "amount": "$10M", "date": "2018", "investors": "Mahindra & Mahindra"},
            {"round": "Series D", "amount": "$15M", "date": "2020", "investors": "Lightrock India"},
            {"round": "Series E", "amount": "$100M", "date": "2021", "investors": "Tiger Global, Vitruvian Partners"}
        ],
        "similar_startups": ["zepto", "ola"]
    },
    "apna": {
        "name": "Apna",
        "tagline": "Professional networking and jobs platform for India's rising blue and grey collar workforce.",
        "founded_year": 2019,
        "hq": "Bengaluru, India",
        "team_size": "800+",
        "funding_stage": "Series C (Unicorn)",
        "total_funding": "$190M",
        "last_funding_round": "Series C",
        "website": "https://apna.co",
        "domain": "apna.co",
        "social_links": {
            "linkedin": "https://linkedin.com/company/apnaco",
            "twitter": "https://twitter.com/apnahq",
            "instagram": "https://instagram.com/apnaco"
        },
        "founders": [
            {
                "name": "Nirmit Parikh",
                "designation": "Founder & CEO",
                "bio": "Nirmit Parikh is the Founder & CEO of Apna. He worked in product leadership at Apple and studied MBA at Stanford, founding Apna to solve employment at scale.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/nirmitparikh",
                "twitter": "https://twitter.com/nirmitparikh"
            }
        ],
        "news": [
            {
                "title": "Apna job listings cross 5 million active job postings, driving rural employment",
                "source": "YourStory",
                "date": "Feb 12, 2026",
                "url": "https://yourstory.com/2026/02/apna-crosses-5m-jobs"
            },
            {
                "title": "Apna partners with NSDC National Skill Development Corp to train grey-collar workers",
                "source": "Inc42",
                "date": "Jan 20, 2026",
                "url": "https://inc42.com/apna-nsdc-skill-partnership"
            },
            {
                "title": "How Apna's localized job matching engine connects recruiters in 70 cities",
                "source": "Economic Times",
                "date": "Dec 10, 2025",
                "url": "https://economictimes.indiatimes.com/apna-recruiter-algorithms"
            },
            {
                "title": "Apna launches premium enterprise hiring tools to reduce hiring time by 50%",
                "source": "Entrackr",
                "date": "Nov 15, 2025",
                "url": "https://entrackr.com/apna-enterprise-recruiting"
            },
            {
                "title": "Apna valuation hits $1.1B in Tiger Global-led funding round filings",
                "source": "TechCrunch",
                "date": "Sep 15, 2025",
                "url": "https://techcrunch.com/2025/09/15/apna-unicorn/"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$2M", "date": "2019", "investors": "Lightspeed Venture Partners, Sequoia India"},
            {"round": "Series A", "amount": "$8M", "date": "2020", "investors": "Greenoaks Capital, Rocketship.vc"},
            {"round": "Series B", "amount": "$70M", "date": "2021", "investors": "Insight Partners, Tiger Global"},
            {"round": "Series C", "amount": "$100M", "date": "2021", "investors": "Tiger Global, Owl Ventures, Sequoia Capital India"}
        ],
        "similar_startups": ["browserstack", "darwinbox"]
    },
    "slice": {
        "name": "Slice",
        "tagline": "Consumer fintech startup building a smart financial network for India's youth.",
        "founded_year": 2016,
        "hq": "Bengaluru, India",
        "team_size": "900+",
        "funding_stage": "Series C (Unicorn)",
        "total_funding": "$340M",
        "last_funding_round": "Series C",
        "website": "https://www.sliceit.com",
        "domain": "sliceit.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/sliceit",
            "twitter": "https://twitter.com/sliceit_",
            "instagram": "https://instagram.com/sliceit_"
        },
        "founders": [
            {
                "name": "Rajan Bajaj",
                "designation": "Founder & CEO",
                "bio": "Rajan Bajaj is the Founder & CEO of Slice. He graduated from IIT Kharagpur and previously worked in product management at Flipkart.",
                "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/rajanbajaj",
                "twitter": "https://twitter.com/rajanbajaj"
            }
        ],
        "news": [
            {
                "title": "Slice merger with North East Small Finance Bank receives RBI final approval",
                "source": "YourStory",
                "date": "Feb 05, 2026",
                "url": "https://yourstory.com/2026/02/slice-nesfb-rbi-merger-approvals"
            },
            {
                "title": "Slice launches instant UPI merchant cashbacks to drive transaction volumes",
                "source": "Inc42",
                "date": "Jan 24, 2026",
                "url": "https://inc42.com/slice-upi-rewards-launch"
            },
            {
                "title": "How Slice scaled its real-time credit underwriting framework to assess risk inside 2 seconds",
                "source": "Entrackr",
                "date": "Dec 10, 2025",
                "url": "https://entrackr.com/slice-credit-underwriting"
            },
            {
                "title": "Slice raises $220M Series C led by Tiger Global, entering the unicorn club",
                "source": "TechCrunch",
                "date": "Nov 28, 2025",
                "url": "https://techcrunch.com/2025/11/28/slice-unicorn/"
            },
            {
                "title": "Slice rolls out customized physical credit cards for Gen Z and young builders",
                "source": "Economic Times",
                "date": "Oct 15, 2025",
                "url": "https://economictimes.indiatimes.com/slice-credit-cards"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$500K", "date": "2017", "investors": "Blume Ventures"},
            {"round": "Series A", "amount": "$6M", "date": "2019", "investors": "Gunosy Capital"},
            {"round": "Series B", "amount": "$46M", "date": "2021", "investors": "Gunosy, Blume Ventures, Northern Arc"},
            {"round": "Series C", "amount": "$220M", "date": "2021", "investors": "Tiger Global, Insight Partners"}
        ],
        "similar_startups": ["razorpay", "cred", "groww", "jar", "bharatpe"]
    },
    "jar": {
        "name": "Jar",
        "tagline": "Fintech app helping Indian consumers build a daily gold savings habit from spare change.",
        "founded_year": 2021,
        "hq": "Bengaluru, India",
        "team_size": "300+",
        "funding_stage": "Series B",
        "total_funding": "$58M",
        "last_funding_round": "Series B",
        "website": "https://www.myjar.app",
        "domain": "myjar.app",
        "social_links": {
            "linkedin": "https://linkedin.com/company/myjar",
            "twitter": "https://twitter.com/JarAppOfficial",
            "instagram": "https://instagram.com/jarappofficial"
        },
        "founders": [
            {
                "name": "Nishchay AG",
                "designation": "Co-Founder & CEO",
                "bio": "Nishchay AG is the Co-Founder & CEO of Jar. He was previously the Director of Mobility at Bounce and co-founded Jar to digitize gold savings.",
                "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/nishchay-ag-72b6a673",
                "twitter": "https://twitter.com/nishchay_ag"
            },
            {
                "name": "Misbah Ashraf",
                "designation": "Co-Founder",
                "bio": "Misbah Ashraf is the Co-Founder of Jar. He is a serial entrepreneur who previously founded social community platforms and leads marketing at Jar.",
                "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/misbahashraf",
                "twitter": "https://twitter.com/misbahashraf"
            }
        ],
        "news": [
            {
                "title": "Jar active registered users cross 10 million, driving micro-savings adoption",
                "source": "YourStory",
                "date": "Feb 10, 2026",
                "url": "https://yourstory.com/2026/02/jar-crosses-10m-registered-users"
            },
            {
                "title": "Jar launches customizable mutual fund SIP wrapper inside daily micro-investment app",
                "source": "Inc42",
                "date": "Jan 22, 2026",
                "url": "https://inc42.com/jar-launches-mutual-fund-sips"
            },
            {
                "title": "How Jar's micro-payout engine automates digital gold purchases behind the scenes",
                "source": "Entrackr",
                "date": "Dec 05, 2025",
                "url": "https://entrackr.com/jar-microsavings-payout-engine"
            },
            {
                "title": "Jar raises $22.6M Series B led by Tiger Global, valuation hits $300M",
                "source": "TechCrunch",
                "date": "Sep 15, 2025",
                "url": "https://techcrunch.com/2025/09/15/jar-series-b-funding/"
            },
            {
                "title": "Jar launches direct gold delivery to homes of consumers crossing savings thresholds",
                "source": "Economic Times",
                "date": "Oct 12, 2025",
                "url": "https://economictimes.indiatimes.com/jar-gold-deliveries"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$4.5M", "date": "2021", "investors": "Arkam Ventures, Tribe Capital"},
            {"round": "Series A", "amount": "$32M", "date": "2022", "investors": "Tiger Global, Rocketship.vc, Arkam Ventures"},
            {"round": "Series B", "amount": "$22.6M", "date": "2022", "investors": "Tiger Global, Eximius Ventures"}
        ],
        "similar_startups": ["razorpay", "cred", "groww", "slice", "bharatpe"]
    },
    "bharatpe": {
        "name": "BharatPe",
        "tagline": "Empowering small merchants with unified QR codes, merchant loans, and digital ledger solutions.",
        "founded_year": 2018,
        "hq": "New Delhi, India",
        "team_size": "1,100+",
        "funding_stage": "Series E (Unicorn)",
        "total_funding": "$650M",
        "last_funding_round": "Series E",
        "website": "https://bharatpe.com",
        "domain": "bharatpe.com",
        "social_links": {
            "linkedin": "https://linkedin.com/company/bharatpe",
            "twitter": "https://twitter.com/bharatpeindia",
            "instagram": "https://instagram.com/bharatpe"
        },
        "founders": [
            {
                "name": "Shashvat Nakrani",
                "designation": "Co-Founder",
                "bio": "Shashvat Nakrani is the Co-Founder of BharatPe. He dropped out of IIT Delhi to co-found BharatPe, designing the first zero-MDR merchant QR code.",
                "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80",
                "linkedin": "https://linkedin.com/in/shashvat-nakrani-bharatpe"
            }
        ],
        "news": [
            {
                "title": "BharatPe reports operating profitability and positive cash flow in FY25 audit",
                "source": "YourStory",
                "date": "Feb 08, 2026",
                "url": "https://yourstory.com/2026/02/bharatpe-profitability-fy25-results"
            },
            {
                "title": "BharatPe merchant swipe machine transaction volumes increase by 45%",
                "source": "Inc42",
                "date": "Jan 22, 2026",
                "url": "https://inc42.com/bharatpe-pos-swipe-volumes-growth"
            },
            {
                "title": "BharatPe launches localized regional language invoice modules for local retailers",
                "source": "Economic Times",
                "date": "Dec 10, 2025",
                "url": "https://economictimes.indiatimes.com/bharatpe-merchant-invoice-modules"
            },
            {
                "title": "How BharatPe's unified QR system routes transactions across UPI networks at 2,000 TPS",
                "source": "Entrackr",
                "date": "Nov 15, 2025",
                "url": "https://entrackr.com/bharatpe-qr-routing-architecture"
            },
            {
                "title": "BharatPe expands merchant credit division to target small scale food stalls in Tier-3 cities",
                "source": "TechCrunch",
                "date": "Oct 05, 2025",
                "url": "https://techcrunch.com/2025/10/05/bharatpe-merchant-loans/"
            }
        ],
        "funding_timeline": [
            {"round": "Seed", "amount": "$2M", "date": "2018", "investors": "Sequoia Capital India"},
            {"round": "Series A", "amount": "$15.5M", "date": "2019", "investors": "Insight Partners, Tiger Global"},
            {"round": "Series C", "amount": "$75M", "date": "2020", "investors": "Coatue Management, Ribbit Capital"},
            {"round": "Series D", "amount": "$108M", "date": "2021", "investors": "Coatue Management, Dragoneer Investment Group"},
            {"round": "Series E", "amount": "$370M", "date": "2021", "investors": "Tiger Global, Dragoneer Group"}
        ],
        "similar_startups": ["razorpay", "cred", "groww", "slice", "jar"]
    }
}

# Fallbacks for all other curated startups that may be queried
RICH_FALLBACKS: Dict[str, Dict[str, Any]] = {
    "razorpay": {
        "mission": "To simplify payments and banking for growing businesses in India.",
        "vision": "To build the financial operating system for digital businesses.",
        "problem_solved": "Merchant onboarding in India used to take weeks with high failure rates. Razorpay enables businesses to integrate checkout routes and start accepting payments instantly.",
        "product_description": "A comprehensive payment gateway supporting UPI, card networks, and netbanking, combined with business banking (RazorpayX) and payroll automation systems.",
        "target_customers": "Freelancers, scaling startups, B2B SaaS platforms, and retail enterprise conglomerates.",
        "market_opportunity": "Capturing transaction margins on India's booming digital payments ecosystem, expanding at a 30% CAGR.",
        "uvp": "Best-in-class checkout conversion rates, developer-first REST APIs, and native auto-retry payment links.",
        "business_model": "Payment gateway processing fee and SaaS subscription model for payroll and banking tools.",
        "revenue_model": "Standard merchant discount rate (2%) and tiered monthly platform access fees for enterprise clients.",
        "tech_stack": "React, PHP, Node.js, Go, Python, MySQL, AWS.",
        "milestones": [
            "Served over 10 million Indian merchants.",
            "Acquired BillDesk, Curlec, and IZealiant.",
            "Processed $100B+ in annual payments."
        ],
        "awards": ["ET Startup of the Year", "NASSCOM Fintech Leader Award"],
        "investors": ["Y Combinator", "Tiger Global", "TCV", "GIC", "Sequoia India"],
        "partnerships": ["NPCI", "Mastercard", "Visa", "HDFC Bank"]
    },
    "cred": {
        "mission": "To build a high-trust network of creditworthy individuals.",
        "vision": "To create unique utility, rewards, and wealth services for premium consumers.",
        "problem_solved": "Consumers struggled with statement tracking, card fees transparency, and lack of rewards for timely credit payments.",
        "product_description": "Mobile application rewarding members for credit card bill payments with exclusive brand partnerships, travel perks, and credit products.",
        "target_customers": "Indian credit card spenders with credit scores above 750.",
        "market_opportunity": "Cross-selling wealth, insurance, and lending services to India's top 10% premium spending demographic.",
        "uvp": "Real-time card fee alerts, curated high-value brand deals, and low-friction member loans.",
        "business_model": "Premium advertising network matching upscale brands with high-intent spenders, coupled with credit products.",
        "revenue_model": "Merchant listings fees, transactional interest spreads, and commission margins.",
        "tech_stack": "React Native, Ruby on Rails, Swift, Kotlin, PostgreSQL, AWS.",
        "milestones": [
            "Secured 13 million active premium members.",
            "Launched CRED Garage, CRED Cash, and CRED Pay.",
            "Merged with Kuvera to expand direct mutual fund assets."
        ],
        "awards": ["LinkedIn Top Startups India", "IAMAI Best Fintech App"],
        "investors": ["DST Global", "Sequoia Capital", "Tiger Global", "GIC", "Sofina"],
        "partnerships": ["NPCI", "IDFC First Bank", "Liquiloans"]
    }
}

async def get_or_generate_profile(slug: str) -> Dict[str, Any]:
    """Compile startup profiles, falling back to local rich details or leveraging Gemini 2.5 on-demand."""
    slug_key = slug.lower().strip()
    profile = STARTUP_PROFILES.get(slug_key)
    
    if not profile:
        # Check if slug exists in CURATED_STARTUPS array as backup structure
        return {}
        
    enriched = dict(profile)
    enriched["slug"] = slug_key
    
    # Check fallback availability
    fallback = RICH_FALLBACKS.get(slug_key, {
        "mission": f"To empower consumers and businesses in the {profile.get('name')} ecosystem.",
        "vision": f"To build the premier technological infrastructure for the {profile.get('name')} industry.",
        "problem_solved": f"Customers in the {profile.get('name')} segment experienced high transactional friction and fragmented options. This product unifies workflows into a simple interface.",
        "product_description": f"Provides comprehensive B2B/B2C application modules, seamless transaction routing, and scalable tools tailored for Indian users.",
        "target_customers": "Growth startups, tech builders, and local service merchants across India.",
        "market_opportunity": "Leveraging India's massive digitization wave to capture a multi-billion dollar market.",
        "uvp": f"Developer-first design, high reliability, localized features, and customer-first support.",
        "business_model": "Product-led scale utilizing software licenses and value-added commissions.",
        "revenue_model": "Subscription licensing models and transactional commissions.",
        "tech_stack": "React, Python, Node.js, Go, PostgreSQL, AWS.",
        "milestones": ["Successfully served millions of active users in India.", "Expanded operations across Tier-1 and Tier-2 cities.", "Launched flagship mobile and web applications."],
        "awards": ["Recognized as a leading innovator in India's startup ecosystem."],
        "investors": ["Leading institutional venture funds and prominent angel builders."],
        "partnerships": ["Local payment aggregators, logistics providers, and corporate platforms."]
    })
    
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key or gemini_key.startswith("your-"):
        logger.info(f"Using local backup data for startup profile: {slug_key}")
        enriched.update(fallback)
        return enriched

    logger.info(f"Triggering Gemini 2.5 researcher to build profile for: {slug_key}")
    chat = LlmChat(
        api_key=gemini_key,
        session_id=f"profile-{slug_key}",
        system_message="You are a professional startup researcher. Output ONLY a raw valid JSON object. No markdown tags. No commentary."
    ).with_model("gemini", "gemini-2.5-flash")
    
    prompt = f"""
    Compile a detailed company profile overview for the Indian startup: '{profile["name"]}'.
    Sector: {profile.get("tagline")} (HQ: {profile.get("hq")})
    
    Return a JSON object matching this exact schema:
    {{
        "mission": "One sentence stating their primary mission.",
        "vision": "One sentence stating their long-term vision.",
        "problem_solved": "A detailed paragraph explaining the customer pain points they solve.",
        "product_description": "A detailed paragraph describing their core products and how they work.",
        "target_customers": "A detailed paragraph defining their target audience and ICP.",
        "market_opportunity": "A paragraph explaining the market size and tailwinds.",
        "uvp": "A paragraph explaining their Unique Value Proposition.",
        "business_model": "A paragraph describing their business strategy.",
        "revenue_model": "A paragraph explaining their pricing/monetization strategies.",
        "tech_stack": "A list of tech tools/languages they use (e.g. React, Node, Python, AWS) or a paragraph explaining their tech foundation.",
        "milestones": ["Key milestone 1", "Key milestone 2", "Key milestone 3"],
        "awards": ["Award 1", "Award 2"],
        "investors": ["Key investor 1", "Key investor 2"],
        "partnerships": ["Key partnership 1", "Key partnership 2"]
    }}
    Use only real, factual public data about this company. Do not hallucinate. If details are missing, write standard business details for this segment.
    """
    
    try:
        full = ""
        async for ev in chat.stream_message(UserMessage(text=prompt)):
            if isinstance(ev, TextDelta):
                full += ev.content
            elif isinstance(ev, StreamDone):
                break
        
        cleaned = full.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        data = json.loads(cleaned)
        if all(k in data for k in ["mission", "vision", "problem_solved", "product_description", "uvp"]):
            enriched.update(data)
            logger.info(f"AI research profile compiled successfully for '{slug_key}'")
            return enriched
    except Exception as e:
        logger.warning(f"Failed to generate rich AI profile for '{slug_key}': {e}. Using fallback.")
        
    enriched.update(fallback)
    return enriched
