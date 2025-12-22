import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const knowledgebaseId = searchParams.get("knowledgebaseId");
    console.log("KNOWLEDGEBASE ID ", knowledgebaseId);

    /*  const query = `
        query GetUserKnowledgebase($knowledgebaseId: ID!) {
          getUserKnowledgebase(knowledgebaseId: $knowledgebaseId) {
            user {
              userId
              email
              title
              caption
              description
              status
              mimeType
              interactionStyle
              responseLength
              responsePerspective
              followUpEncouragement
              disclaimerText
              disclaimerLink
              customFooterText
              customFooterLink
              hideFooter
              addBadge
              showContactMe
            }
            knowledgeBaseDocs {
              created_at
              sourceType
              uuid
              name
              size
              id
              s3Key
              mimeType
            }
          }
        }
      `; */
    const query = `
        query GetUserKnowledgebase($knowledgebaseId: ID!) {
          getUserKnowledgebase(knowledgebaseId: $knowledgebaseId) {
            user {
              userId
              title
              caption
              description
              mimeType
              interactionStyle
              responseLength
              responsePerspective
              followUpEncouragement
              disclaimerText
              disclaimerLink
              customFooterText
              customFooterLink
              hideFooter
              addBadge
              showContactMe
            }
           
          }
        }
      `;
    const data = await graphqlRequestUserPool({
      query,
      variables: { knowledgebaseId },
    });
    return NextResponse.json(data.getUserKnowledgebase);
  } catch (err) {
    return handleApiError(err, "get user knowledgebase failed");
  }
}
