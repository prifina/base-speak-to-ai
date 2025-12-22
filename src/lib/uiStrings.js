export const UI_TEXT = {
  app: {
    title: "Base",
  },

  qrCode: {
    title: "Your AI Twin QR Code",
    shareMessage: "Share Your AI Twin",
  },

  unsavedChangesWarning: {
    leave: "Leave",
    warning: "Changes that you made may not be saved",
    question: "Leave Page?",
  },

  personalization: {
    sectionTitle: "Personalization",

    disclaimerAndExamples: {
      title: "Disclaimer and Example Questions",
      disclaimer: {
        text: "Disclaimer shown to User",
        link: "Additional URL for more details about you (You can add optional link - shown in disclaimer)",
      },
      examples: {
        title: "Example Question",
        count: "Number of example questions displayed",
        types: "Categories of example questions",
        listHeader: "Example Questions for User Prompt",
        addButton: "Add New",
      },
    },

    behavior: {
      title: "Behavior Settings",
      sectionTitle:
        "Customize how your AI Twin responds and interacts. Suggestions? Request a style.",
      followUp: {
        title: "Conversational Mode",
        description:
          "Have the AI Twin end replies with a question or a suggestion. Defaults to off if not selected.",
      },
      defaultResponseLength: {
        title: "Response Length",
        description:
          "Set response length to shorter or longer. If not set, responses default to normal.",
      },
      interactionStyle: {
        title: "Interaction Style",
        description:
          "Choose the style how your AI Twin communicates its responses. If not set, style default to neutral.",
      },
      responsePerspective: {
        title: "Response Perspective",
        description:
          "Choose how the AI Twin presents itself during interactions—either as an AI version of you or as a separate representative of you.",
      },
    },

    discoverability: {
      title: "Discoverability Settings",
      hubVisibility: {
        title: "Visibility in Prifina Hub",
        description:
          "Control whether your AI profile is visible in the Prifina Hub app",
      },
      hubDescription: "Longer AI Twin Description at Hub ",
      publicVisibility: {
        title: "Additional Marketing Visibility",
        description: "My AI twin profile can be promoted publicly. ",
      },
      socials: {
        title: "Social Links (optional)",
        urlLabel:
          "Add title to URL (e.g., LinkedIn, Instagram) or leave blank for just the URL",
        urlPlaceholder: "Add URL for your LinkedIn, Instagram, etc.",
      },
      testimonial: {
        visible: "Testimonial for marketing purposes",
        text: "Your Testimony",
      },
      seoVisibility: {
        title: "SEO Visibility",
        description:
          "Control whether your profile is visible for external search engines like Google.",
      },
    },

    footer: {
      title: "Footer Settings",
      contactMe: {
        title: "Show contact me button",
        description:
          "Allow users to share their email address if they want to be contacted by you.",
      },
      customFooter: {
        title: "Custom Footer Text",
        noFooter: "No Footer",
        linkText: "Show Text with Link",
        textLabel: "Text shown",
        linkLabel: "Add Link",
        optionalLink: "(You can add optional link)",
      },
    },
  },

  insights: {
    sectionTitle: "Insights",
    exportButton: "Export as CSV",
    messages: {
      flag: "Flag it for Prifina",
      match: "Match",
      translated: "Translated from English",
      score: "Score",
    },
    reports: {
      active: "Daily Report Active",
      emailPrompt: "Email address for Daily Report",
    },
    sessions: {
      title: "Sessions",
      dateRange: "Date Range",
      table: {
        messageTime: "Time",
        sessionDuration: "Duration",
        messageCount: "Messages",
        averageMatch: "Average Match",
        engagementCount: "Engagement",
        showMoreMessages: "More",
      },
    },
    liveFeed: {
      title: "Live Feed",
      recentMessagesCount: "Showing the Last 50 Messages",
      messagesTableTitle: "Messages",
    },
  },

  knowledgeBase: {
    sectionTitle: "Knowledge Base",
    fileTable: {
      title: "Files in Knowledge Base",
      fileName: "File",
      fileSize: "Size",
      uploadDate: "Uploaded On",
      fileDetails: "About this file",
      viewNotes: "View Notes",
      notes: "Notes",
      download: "Download",
      delete: "Delete",
      noFiles: "No files uploaded",
    },
    attachments: {
      files: "Attached Files",
      noFiles: "No files here",
      uploadPrompt: "Upload Attached Files",
    },
    quickAdd: {
      prompt: "Write or paste new information directly to the Knowledge Base",
      button: "Quick Add",
      title: "Enter title",
      add: "Add Knowledge Entry",
      edit: "Edit Knowledge Entry",
      content: "Write or paste your content here (max 2000 characters)",
      save: "Save and Exit",
    },

    fileDrag: {
      instructions:
        "Drag and drop files here, or click to select. Maximum file size: 5 MB. You can upload up to 5 files at a time.",
      activeInstructions: "Drop the files here ...",
      supportedFormats:
        "Supported files: .txt, .md, .pdf, .docx, .rtf, .odt and .epub",
    },
  },

  profile: {
    sectionTitle: "Twin Profile",
    aiTwin: "AI Twin",
    namePlaceholder: "e.g., Bob AI, Worker AI, Alice AI, etc",
    nameLabel: "AI Twin Name",
    visibleDescription: "Short Intro",
    descriptionPlaceholder:
      "e.g., Amplifying expertise in digital marketing & strategy",
    invisibleDescription: "Link Sharing Preview",
    avatar: {
      notAnImage: "Not an image.",
      allowedSize: "Allowed size is <150Kb.",
      selectedImage: "Selected image was: ",
      squareImage: "Please select a square image.",
      imageFailed: "Failed to load image.",
      editText: "Edit Picture",
      helpText:
        "Use a square image (e.g., 300×300 px). Max file size 150 KB (e.g., .png .jpg).",
    },
  },

  general: {
    inputPlaceholder: "Type here",
    searchPlaceholder: "Search",
    cancel: "Cancel",
  },
};
