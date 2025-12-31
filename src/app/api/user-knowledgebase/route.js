import { NextResponse } from "next/server";
import { graphqlRequestUserPool } from "@/lib/graphqlRequestUserPool";
import { handleApiError } from "@/lib/apiErrorHandler";
import { isUrlOnline } from "@/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const knowledgebaseId = searchParams.get("knowledgebaseId");
    const opt = searchParams.get("opt");
    console.log("KNOWLEDGEBASE ID ", knowledgebaseId);
    console.log("OPT", opt);
    let query;

    if (!opt) {
      query = `
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
              status
            }
          }
        }
      `;
    } else if (opt === "EMAIL") {
      query = `
        query GetUserKnowledgebase($knowledgebaseId: ID!) {
          getUserKnowledgebase(knowledgebaseId: $knowledgebaseId) {
            user {
              hour30
              dailyReport
              email
            }
          }
        }
      `;
    } else if (opt === "STATUS") {
      query = `
        query GetUserKnowledgebase($knowledgebaseId: ID!) {
          getUserKnowledgebase(knowledgebaseId: $knowledgebaseId) {
            user {
              status
              trialEnds
              statusChanged
            }
          }
        }
      `;
    } else if (opt === "DOCS") {
      query = `
        query ListDocfiles($knowledgebaseId: ID!, $limit: Int, $nextToken: String) {
          listDocfiles(knowledgebaseId: $knowledgebaseId, limit: $limit, nextToken: $nextToken) {
            items {
              id
              knowledgebaseId
              meta {
                fname
                lastModified
                name
                s3Key
                size
                type
              }
              created_at
            }
            nextToken
          }
        }
      `;
    }

    let data;
    let allItems = [];

    if (opt === "DOCS") {
      let nextToken = null;
      do {
        const result = await graphqlRequestUserPool({
          query,
          variables: { knowledgebaseId, limit: 50, nextToken },
        });
        allItems = allItems.concat(result.listDocfiles.items);
        nextToken = result.listDocfiles.nextToken;
      } while (nextToken);

      data = { listDocfiles: { items: allItems } };
    } else {
      data = await graphqlRequestUserPool({
        query,
        variables: { knowledgebaseId },
      });
    }

    console.log("USER KNOWLEDGEBASE ", data);

    if (opt === "DOCS") {
      return NextResponse.json({ knowledgeBaseDocs: allItems });
    }

    if (opt === "EMAIL" || opt === "STATUS") {
      return NextResponse.json(data.getUserKnowledgebase);
    }

    if (data.getUserKnowledgebase.user && !opt) {
      if (data.getUserKnowledgebase.user.mimeType) {
        const fileExtension =
          data.getUserKnowledgebase.user.mimeType?.split("/")[1];

        const avatarUrl = `https://s3.${process.env.MY_REGION}.amazonaws.com/${process.env.SPEAK_TO_CDN}/avatars/${data.getUserKnowledgebase.user.userId}.${fileExtension}`;
        const avatarExists = await isUrlOnline(avatarUrl);

        console.log("AVARTAR URL ", avatarUrl);
        // console.log("EXISTS ", await isUrlOnline(avatarExists));
        if (avatarExists) {
          data.getUserKnowledgebase.user.avatar = avatarUrl;
        }
      }
    }

    return NextResponse.json(data.getUserKnowledgebase);
  } catch (err) {
    return handleApiError(err, "get user knowledgebase failed");
  }
}
