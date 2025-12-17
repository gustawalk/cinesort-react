import { Request, Response } from "express";
import {
  getUserLists,
  createNewList,
  deleteUserList,
  drawFromList,
  addMovieToList,
  editMoviesLists,
  deleteMovieFromList,
  getPopularLists,
  importMovieListToUser
} from "@/services/list.service";

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

type DeleteStatus = "deleted"

export const deleteList = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const { listId } = req.body;

  const result = await deleteUserList(listId, user.id)

  const responsesMap: Record<DeleteStatus, () => Response> = {
    deleted: () => res.status(200).json({ message: "List deleted succefully" })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" })
}

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

type EditStatus = "ok" | "no_content"

export const editList = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const listIdRaw = req.params.id;
  const listId = Number(listIdRaw)
  if (isNaN(listId)) {
    return res.status(400).json({ message: "Invalid list ID" });
  }

  const result = await editMoviesLists(listId, user.id)

  const responsesMap: Record<EditStatus, () => Response> = {
    ok: () => res.status(200).json({ message: "Ok", movies: result.movies }),
    no_content: () => res.status(204).json({ message: "No movies found", movies: null })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" });
}

type DrawStatus = "ok" | "no_content" | "pendency"

export const drawList = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const listIdRaw = req.params.id;
  const listId = Number(listIdRaw)
  if (isNaN(listId)) {
    return res.status(400).json({ message: "Invalid list ID" });
  }

  const result = await drawFromList(listId, user.id)

  const responsesMap: Record<DrawStatus, () => Response> = {
    ok: () => res.status(200).json({ message: "Movie draw", movie: result.movie }),
    no_content: () => res.status(204).json({ message: "No movie found in list", movie: null }),
    pendency: () => res.status(409).json({ message: "User has a pendency", movie: null })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" })
}

type AddStatus = "ok" | "conflict"

export const movieAddList = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const { listId, movieId } = req.body;

  const result = await addMovieToList(listId, movieId, user.id);

  const responsesMap: Record<AddStatus, () => Response> = {
    ok: () => res.status(200).json({ message: "Movie inserted" }),
    conflict: () => res.status(409).json({ message: "Movie already in the list" })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]()
  }

  return res.status(500).json({ message: "Something went wrong" })
}

type DeleteFromList = "deleted"

export const movieDeleteList = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const { listId, movieId } = req.body;

  const result = await deleteMovieFromList(listId, movieId, user.id);

  const responsesMap: Record<DeleteFromList, () => Response> = {
    deleted: () => res.status(200).json({ message: "Deleted succefully" })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" })
}

type PopularReturn = "ok"

export const popularList = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const result = await getPopularLists();

  const responsesMap: Record<PopularReturn, () => Response> = {
    ok: () => res.status(200).json({ message: "ok", popularLists: result.lists })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" })
}

export const popularListDetail = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const idRaw = req.params.id;
  const id = Number(idRaw)

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid list UUID" });
  }

  const result = await editMoviesLists(id, 0)

  const responsesMap: Record<EditStatus, () => Response> = {
    ok: () => res.status(200).json({ message: "Ok", movies: result.movies }),
    no_content: () => res.status(204).json({ message: "No movies found", movies: null })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" })
}

type ImportResult = "imported" | "forbidden" | "conflict"

export const importMovieList = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(500).json({ message: "User data missing from request" });
  }

  const { listId } = req.body

  const result = await importMovieListToUser(listId, user.id)

  const responsesMap: Record<ImportResult, () => Response> = {
    imported: () => res.status(200).json({ message: "Imported" }),
    forbidden: () => res.status(403).json({ message: "User don't have permission" }),
    conflict: () => res.status(409).json({ message: "User already has a list with this name" })
  }

  if (responsesMap[result.status]) {
    return responsesMap[result.status]();
  }

  return res.status(500).json({ message: "Something went wrong" })
}
