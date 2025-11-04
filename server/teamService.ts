import { getDb } from './db';

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export async function createTeam(
  name: string,
  ownerId: string,
  description?: string
): Promise<Team | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const team: Team = {
      id: crypto.randomUUID(),
      name,
      description,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(teamsTable).values(team);
    
    // Add owner as team member
    await addTeamMember(team.id, ownerId, 'owner');

    return team;
  } catch (error) {
    console.error('[Team] Failed to create:', error);
    return null;
  }
}

export async function getTeams(userId: string): Promise<Team[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const members = await db.query.teamMembers.findMany({
      where: (tm, { eq }) => eq(tm.userId, userId),
    });

    const teamIds = members.map(m => m.teamId);
    if (teamIds.length === 0) return [];

    return await db.query.teams.findMany({
      where: (teams, { inArray }) => inArray(teams.id, teamIds),
    });
  } catch (error) {
    console.error('[Team] Failed to fetch:', error);
    return [];
  }
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member'
): Promise<TeamMember | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const member: TeamMember = {
      id: crypto.randomUUID(),
      teamId,
      userId,
      role,
      joinedAt: new Date(),
    };

    await db.insert(teamMembersTable).values(member);
    return member;
  } catch (error) {
    console.error('[Team] Failed to add member:', error);
    return null;
  }
}

export async function removeTeamMember(teamId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(teamMembersTable)
      .where(and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, userId)
      ));
    return true;
  } catch (error) {
    console.error('[Team] Failed to remove member:', error);
    return false;
  }
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.query.teamMembers.findMany({
      where: (tm, { eq }) => eq(tm.teamId, teamId),
    });
  } catch (error) {
    console.error('[Team] Failed to fetch members:', error);
    return [];
  }
}

export async function updateTeamMemberRole(
  teamId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member'
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(teamMembersTable)
      .set({ role })
      .where(and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, userId)
      ));
    return true;
  } catch (error) {
    console.error('[Team] Failed to update role:', error);
    return false;
  }
}
