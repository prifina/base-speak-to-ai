export const UI_TEXT = {
  app: {
    title: "Base",
    menu: "Menu",
    help: "Help",
  },

  qrCode: {
    title: "Your AI Twin QR Code",
    shareMessage: "Share Your AI Twin",
    defaultShareMessage:
      "The next step in my evolution: My AI twin. Ask me anything! ",
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
        textPlaceholder: "Your disclaimer shown to user",
        link: "Additional URL for more details about you (You can add optional link - shown in disclaimer)",
        linkPlaceholder: "Enter the url here",
      },
      examples: {
        title: "Example Question",
        count: "Number of example questions displayed",
        types: "Categories of example questions",
        listHeader: "Example Questions for User Prompt",
        addButton: "Add New",
        tooltip: {
          automated: {
            title: "Automated Questions:",
            description: "Questions generated from your knowledge base",
          },
          manual: {
            title: "Manual Questions:",
            description: "Predefined questions you create",
          },
          mix: {
            title: "1:1 Mix:",
            description: "Alternates between manual and automated questions",
          },
        },
        modal: {
          title: "Example Question",
          placeholder: "e.g., What are your thoughts on digital marketing?",
          cancel: "Cancel",
          save: "Save",
        },
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
        defaultText: "Default",
        defaultTextValue: "Get your own digital AI twin.",
        defaultLinkValue: "https://www.prifina.com/",
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
      invalidEmail: "Invalid email address",
    },
    sessions: {
      title: "Sessions",
      dateRange: "Date Range",
      dateRangeOr: "or",
      dateRangeOptions: {
        last7Days: "Last 7 days",
        last30Days: "Last 30 days",
        last90Days: "Last 90 days",
        last6Months: "Last 6 months",
        lastYear: "Last year",
        allTime: "All time",
      },
      duration: "Duration",
      messages: "Messages",
      avgScore: "Avg Score",
      noContentFound: "No content found/used",
      exampleQuestion: "(example question)",
      score: "Score",
      quality: "Quality",
      noMessages: "No messages found",
      exportButton: "Export JSON",
      itemsPerPage: "Items per page",
      showingText: "Showing",
      ofText: "of",
      sessionsText: "sessions",
      pageText: "Page",
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
    quota: {
      label: "Upload Quota Used",
    },
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
        "Drag and drop files here, or click to select. Maximum file size: 500 MB. You can upload up to 5 files at a time.",
      activeInstructions: "Drop the files here ...",
      supportedFormats:
        "Supported files: .txt, .md, .pdf, .docx, .rtf, .odt and .epub",
    },
    uploadErrors: {
      tooManyFiles: {
        title: "Too many files",
        description: "Maximum 5 files allowed at a time",
      },
      duplicateFile: {
        title: "Duplicate file",
        description: "File already exists in the list",
      },
      quotaExceeded: {
        title: "Quota exceeded",
        description: "Total file size exceeds the 500MB limit",
      },
    },
    uploadSuccess: {
      title: "Upload successful",
      description: (count) => `${count} file(s) uploaded`,
    },
    uploadFailed: {
      title: "Upload failed",
    },
    processingTimeline: {
      titleSuccess: "Processing Status",
      titleFailed: "Processing Failed",
      uploadFailed: "Upload Failed",
      processingStarted: "Uploaded Content Processing Started",
      existingFilesNote: (count) => `Note: ${count} file${count > 1 ? "s" : ""} already existed in the knowledge base`,
      duplicateFilesLabel: "Duplicate files:",
      chunkingComplete: "Chunking of Uploaded Documents is Complete",
      knowledgeBaseReady: "Knowledge Base Ready",
      readyDescription: "Processing still continues in background, but knowledge base is ready to be used.",
      closeButton: "Close",
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
      allowedSize: "Allowed size is <5M.",
      selectedImage: "Selected image was: ",
      squareImage: "Please select a square image.",
      imageFailed: "Failed to load image.",
      editText: "Edit Picture",
      helpText:
        "Use a square image (e.g., 300×300 px). Max file size 5 M (e.g., .png .jpg).",
    },
  },

  account: {
    sectionTitle: "Account",
    givenName: "First Name",
    familyName: "Last Name",
    email: "Email",
    username: "Login Username",
    usernameMissing: "Login username not created yet",
    usernameHelper: "10-30 characters, no spaces or special characters",
    usernameErrors: {
      length: "Username must be 10-30 characters",
      spaces: "Username cannot contain spaces",
      email: "Username cannot be an email address",
      exists: "Username already exists",
    },
    emailErrors: {
      invalid: "Invalid email address",
      exists: "Email already exists",
    },
    emailVerified: "Email Verified",
    emailNotVerified: "Email Not Verified",
    verifyEmail: "Verify Email",
    verificationCodeSent: "Verification code sent to your email",
    enterVerificationCode: "Enter the 6-digit code sent to your email",
    resendCode: "Resend Code",
    verifyButton: "Verify",
    verificationSuccess: "Email verified successfully",
    verificationFailed: "Invalid verification code",
    emailMustBeVerified: "Email must be verified before making other changes",
    saveSuccess: "Account information updated successfully",
    saveFailed: "Failed to update account information",
    mfa: {
      title: "Multi-Factor Authentication (MFA)",
      connectAuthenticator: "Connect Your Authenticator",
      reconnectAuthenticator: "Reconnect Your Authenticator",
      scanQrCode: "Scan QR Code",
      openAuthenticator: "Open",
      authenticatorApp: "Authenticator",
      scanInstruction: "on your mobile phone and scan this QR code",
      manualSetupInstruction: "If you can't connect using QR code, touch",
      connectManually: "CONNECT MANUALLY",
      manualSetupInstructionEnd: "on your mobile phone and type this code.",
      next: "Next",
      verifyCode: "Verify Code",
      enterVerificationCode: "Enter the 6-digit code from your authenticator app",
      setupSuccess: "Authenticator connected successfully",
      setupFailed: "Failed to connect authenticator",
    },
  },

  general: {
    inputPlaceholder: "Type here",
    searchPlaceholder: "Search",
    cancel: "Cancel",
  },
};
