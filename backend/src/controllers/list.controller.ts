import { Request, Response } from "express";
import { getUserLists, createNewList } from "@/services/list.service";

type UserListsReturn = "ok" | "no_content";

export const userLists = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const result = await getUserLists({ id: user.id });

  const responsesMap: Record<UserListsReturn, () => Response> = {
    ok: () => res.status(200).json({ user_lists: result.user_lists }),
    no_content: () => res.status(200).json({ user_lists: result.user_lists })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(400).json({ message: "User list not found" });
};

type CreateStatus = "conflict" | "created";

export const createList = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }
  const { listName } = req.body;

  const result = await createNewList(user.id, listName)

  const responsesMap: Record<CreateStatus, () => Response> = {
    conflict: () => res.status(409).json({ message: "User already has a list with this name" }),
    created: () => res.status(200).json({ message: "List created succefully" }),
  };

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" })
}
