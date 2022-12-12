interface ReactionRole {
    id: string;
    emoji: string;
}

export interface RoleMenu {
    name: string;
    title: string;
    description: string;
    channel: string;
    type: MenuType;
    roles: ReactionRole[];
    message?: string;
}

export interface Guild {
    id: string;
    menus: RoleMenu[];
}
