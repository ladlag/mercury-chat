// src/capabilities/index.ts
import { registerCapability } from "@/capabilities/registry";

import { ChatDefaultCapability, ChatSecondCapability } from "@/capabilities/chat/chat.capability";
import { ChatThirdCapability } from "@/capabilities/chat/chat-third.capability";
import { RequirementAgentCapability } from "@/capabilities/requirement/requirement.capability";
import { AuthCapability } from "@/capabilities/auth/auth.capability";

registerCapability(AuthCapability);
registerCapability(ChatDefaultCapability);
registerCapability(ChatSecondCapability);
registerCapability(ChatThirdCapability);
registerCapability(RequirementAgentCapability);