// src/capabilities/index.ts
import { registerCapability } from "@/capabilities/registry";

import { ChatDefaultCapability, ChatSecondCapability } from "@/capabilities/chat/chat.capability";
import { ChatThirdCapability } from "@/capabilities/chat/chat-third.capability";
import { RequirementAgentCapability } from "@/capabilities/requirement/requirement.capability";

registerCapability(ChatDefaultCapability);
registerCapability(ChatSecondCapability);
registerCapability(ChatThirdCapability);
registerCapability(RequirementAgentCapability);