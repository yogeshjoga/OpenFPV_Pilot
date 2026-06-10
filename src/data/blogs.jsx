import { BookOpen, Briefcase, Shield, ToyBrick } from 'lucide-react'

export const BLOGS = [
  {
    id: 'fresher-doubt-resolution',
    title: 'Doubt Resolutions for Freshers',
    excerpt: 'Breaking into FPV without breaking the bank or getting overwhelmed. Everything you need to know to take your first flight.',
    category: 'Beginners',
    author: 'EGIRE Team',
    date: 'Oct 24, 2026',
    icon: BookOpen,
    readTime: '5 min read',
    content: `
# Breaking into FPV: A Fresher's Guide

Starting out in FPV can feel like learning a new language. You have to understand KV ratings, VTX bands, Betaflight configurations, and PID tuning before you even get off the ground.

## Common Doubts Resolved

**1. Is FPV too expensive to start?**
Not anymore. While premium racing rigs can cost thousands, you can start with a competent micro-drone (like a "Tiny Whoop") and an entry-level radio for under $200. We highly recommend starting with a simulator like our built-in Physics engine to build muscle memory without repair costs.

**2. Will I crash?**
Yes. Everyone crashes. It is part of the hobby. That is exactly why we teach you how to build your drone from scratch. If you know how to assemble it, you know how to fix it when it breaks.

**3. Do I need to know how to code?**
No coding is required! The flight controller software (Betaflight) has a visual interface. You just need to follow configuration steps, not write code.

**Our Advice:** Start small, use a simulator, and don't skip the basics of battery safety.
    `
  },
  {
    id: 'experienced-professionals',
    title: 'Upskilling for Experienced Professionals',
    excerpt: 'How engineers and tech professionals can leverage FPV drone building to master embedded systems and aerodynamics.',
    category: 'Advanced',
    author: 'Lead Engineer',
    date: 'Nov 02, 2026',
    icon: Briefcase,
    readTime: '8 min read',
    content: `
# Beyond the Hobby: FPV for Professionals

If you are already an engineer, software developer, or hardware enthusiast, FPV drones represent the ultimate sandbox for your skills. 

## The Technical Deep Dive

Building an FPV drone from the frame up touches on several engineering disciplines:

**Embedded Systems & Firmware**
Flight controllers run sophisticated RTOS (Real-Time Operating Systems). Understanding how gyro loops communicate with ESCs (Electronic Speed Controllers) via DSHOT protocols gives you hands-on experience with high-frequency control loops.

**RF Engineering**
Navigating the 5.8GHz analog or digital video spectrum involves understanding antenna polarization, multipathing, and signal penetration. 

**Aerodynamics & Physics**
Tuning PID controllers (Proportional-Integral-Derivative) to achieve locked-in flight performance requires a deep understanding of resonance, thrust-to-weight ratios, and mechanical filtering.

Whether you want to transition into the commercial drone industry or just need a highly technical hobby that challenges you, FPV provides a unique, multidisciplinary engineering challenge.
    `
  },
  {
    id: 'tactical-fpv-army',
    title: 'Tactical FPV for Defense Personnel',
    excerpt: 'Military and army applications, rugged builds, and strategic FPV operations in modern environments.',
    category: 'Defense',
    author: 'Tactical Operations',
    date: 'Nov 15, 2026',
    icon: Shield,
    readTime: '6 min read',
    content: `
# FPV in Modern Defense Operations

The landscape of tactical reconnaissance and situational awareness has been fundamentally altered by the advent of FPV (First Person View) technology. 

## Tactical Advantages of FPV

Unlike traditional GPS-guided automated drones, FPV provides unparalleled agility and responsiveness. 

**1. GPS-Denied Environments**
Standard drones rely heavily on GPS. FPV pilots fly entirely manually (Acro mode), allowing them to operate deep inside buildings, dense forests, or environments where GPS signals are jammed or unavailable.

**2. Speed and Interception**
A specialized 5-inch FPV drone can exceed speeds of 150 km/h in seconds. This allows for rapid deployment, target interception, and evasion capabilities that traditional quadcopters cannot match.

**3. Rugged and Field-Repairable**
A tactical requirement is field maintainability. Carbon fiber FPV frames can survive massive impacts, and because they are modular, a damaged motor or arm can be replaced by a soldier in the field in minutes using standard tools.

Our platform provides the foundational knowledge required to build, maintain, and pilot these highly agile systems under demanding conditions.
    `
  },
  {
    id: 'kids-can-fly',
    title: 'Kids Can Fly Too!',
    excerpt: 'Safe, beginner-friendly paths for children to learn robotics, electronics, and aerodynamics through micro drones.',
    category: 'Education',
    author: 'Education Team',
    date: 'Dec 05, 2026',
    icon: ToyBrick,
    readTime: '4 min read',
    content: `
# Nurturing Future Engineers

You might look at a 100mph racing drone and think, "That is definitely not for my 10-year-old." You'd be right. But FPV is a massive spectrum, and the entry point is perfect for kids!

## The Tiny Whoop Revolution

"Tiny Whoops" are micro-drones that fit in the palm of your hand. They weigh less than 40 grams and have fully enclosed propeller guards. 

**Why they are perfect for kids:**
- **Utterly Safe:** They bounce off walls, TVs, and people without causing any damage.
- **STEM Learning:** Kids learn about batteries, circuits, radio frequencies, and physics without even realizing they are studying.
- **Hand-Eye Coordination:** Flying FPV builds spatial awareness and fine motor skills.

**How to Start:**
1. Get a basic gamepad-style radio controller.
2. Let them practice on an FPV Simulator on the computer.
3. Once they can hover, graduate to an indoor Tiny Whoop.

It is the most fun way to trick your kids into learning applied physics and electronics!
    `
  }
]
