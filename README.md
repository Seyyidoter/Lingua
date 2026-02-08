# Linguino

**Linguino** is a modern, AI-powered language learning application designed to help you master vocabulary through context-based learning. Built with **Next.js 15**, **React 19**, and powered by **Google Gemini 3 Flash**, it offers a premium, personalized learning experience.

## Inspiration

I built this project to support my younger sibling's English learning journey. Noticing that children their age are reading fewer books, I wanted to create a tool that makes reading fun and relevant. Linguino uses AI to weave the specific words studied each day into entertaining stories, ensuring that vocabulary is practiced in context while keeping the learner engaged as they build their reading habit.

![App Screenshot](https://github.com/user-attachments/assets/941e9208-333b-4587-a59d-902c819a521a)

<!-- 
Add your new screenshots here! 
Example:
![Story Mode Screenshot](https://github.com/user-attachments/assets/your-new-image-id)
-->

## Features

- **AI-Powered Story Mode**: Meet **Linguini**, your AI companion. It generates unique, fun short stories using **the specific words you studied today**, helping you understand vocabulary in context and enjoy reading.
- **Oxford 3000 Integration**: Practice with the most important 3000 words in English, filtered by CEFR levels (A1-C1).
- **Spaced Repetition System (SRS)**: Smart algorithms ensure you review words at the perfect time to maximize retention.
- **Premium UI/UX**:
  - **Glassmorphism Design**: Sleek, translucent cards and panels.
  - **Mesh Gradients**: Dynamic, calming backgrounds.
  - **Smooth Animations**: Powered by `framer-motion` for a fluid feel.
- **Fully Responsive**: Optimized for mobile, tablet, and desktop.
- **Streak Tracking**: Keep your motivation high with daily practice streaks.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Directory)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI Model**: [Google Gemini 3 Flash (Preview)](https://ai.google.dev/)
- **Font**: [Outfit](https://fonts.google.com/specimen/Outfit)

## Getting Started

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Seyyidoter/Linguino.git
    cd Linguino
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## Security

This project is kept up-to-date with the latest security patches (including React2Shell fixes). We prioritize secure coding practices and dependency management.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built with ❤️ by Seyyidoter*
