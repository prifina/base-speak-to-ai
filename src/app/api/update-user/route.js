import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { withTelemetryRoute } from "@prifina-dev/next-telemetry/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request) {
  try {
    const body = await request.json();
    const { userId, avatar, ...rest } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is missing" }, { status: 400 });
    }

    const variables = { userId, ...rest };

    /* if (avatar && !avatar.startsWith("https://")) {
      const mimeType = avatar.split(";")[0].slice(5);
      const fileExtension = mimeType.split("/")[1];
      variables.avatarKey = `avatars/${userId}.${fileExtension}`;
      variables.mimeType = mimeType;
      variables.addBadge = true;
    } */

    const mutation = `
      mutation UpdateUser(
        $userId: ID!
        $ownerId: ID
        $knowledgebaseId: ID
        $networkId: String
        $email: String
        $title: String
        $caption: String
        $description: String
        $status: String
        $mimeType: String
        $interactionStyle: String
        $responseLength: String
        $responsePerspective: String
        $followUpEncouragement: String
        $disclaimerText: String
        $disclaimerLink: String
        $customFooterText: String
        $customFooterLink: String
        $hideFooter: Boolean
        $addBadge: Boolean
        $showContactMe: Boolean
        $isHubVisible: Boolean
        $isMarketingVisible: Boolean
        $isMarketplaceVisible: Boolean
        $isSEOVisible: Boolean
        $dailyReport: Boolean
        $visibilitySocials: [String]
        $showTestimonialForMarketing: Boolean
        $testimonial: String
        $noOfExampleQuestions: Int
        $typeOfExampleQuestions: Int
        $exampleQuestions: [String]
        $hubDescription: String
        $hour30: String
      ) {
        updateUser(
          userId: $userId
          ownerId: $ownerId
          knowledgebaseId: $knowledgebaseId
          networkId: $networkId
          email: $email
          title: $title
          caption: $caption
          description: $description
          status: $status
          mimeType: $mimeType
          interactionStyle: $interactionStyle
          responseLength: $responseLength
          responsePerspective: $responsePerspective
          followUpEncouragement: $followUpEncouragement
          disclaimerText: $disclaimerText
          disclaimerLink: $disclaimerLink
          customFooterText: $customFooterText
          customFooterLink: $customFooterLink
          hideFooter: $hideFooter
          addBadge: $addBadge
          showContactMe: $showContactMe
          isHubVisible: $isHubVisible
          isMarketingVisible: $isMarketingVisible
          isMarketplaceVisible: $isMarketplaceVisible
          isSEOVisible: $isSEOVisible
          dailyReport: $dailyReport
          visibilitySocials: $visibilitySocials
          showTestimonialForMarketing: $showTestimonialForMarketing
          testimonial: $testimonial
          noOfExampleQuestions: $noOfExampleQuestions
          typeOfExampleQuestions: $typeOfExampleQuestions
          exampleQuestions: $exampleQuestions
          hubDescription: $hubDescription
          hour30: $hour30
        ) {
          userId
        }
      }
    `;

    await graphqlRequestUserPool({ query: mutation, variables });

    return NextResponse.json({ statusText: "OK" });
  } catch (err) {
    return handleApiError(err, "update user failed");
  }
}

export const POST = withTelemetryRoute(handler);
