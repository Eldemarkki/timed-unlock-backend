import { ObjectId } from "mongoose";
import Item from "../data/Item";
import Project, { IProject } from "../data/Project";
import { MissingPermissionsToProjectError, NoProjectFoundError } from "../utils/errors";

export const getAllProjects = async (userId: string | ObjectId) => {
    return await Project.find({ admin: userId })
}

export const getProject = async (projectId: string | ObjectId, userId: string | ObjectId) => {
    const project = await Project.findById(projectId);
    if (!project) throw NoProjectFoundError;
    if (String(project.admin) !== String(userId)) throw MissingPermissionsToProjectError;
    return project
}

export const createProject = async (projectName: string, userId: string | ObjectId, items: [string | ObjectId]) => {
    return await Project.create({
        name: projectName,
        admin: userId,
        items: items
    })
}

export const getUnlockedItems = async (projectId: string | ObjectId) => {
    return await Item.find({
        projectId: projectId,
        unlockDate: {
            $lte: new Date()
        }
    });
}

export const getAllItems = async (project: IProject, userId: string | ObjectId) => {
    if (String(project.admin) !== String(userId)) throw MissingPermissionsToProjectError;
    return await Item.find({
        project: project.id
    });
}

export const createNewItem = async (data: string, unlockDate: Date, user: string | ObjectId, project: IProject) => {
    if (String(project.admin) !== String(user)) throw MissingPermissionsToProjectError;
    const newItem = await Item.create({
        data,
        unlockDate,
        admin: user,
        project: project.id
    });
    project.items.push(newItem)
    await project.save();
    return newItem;
}