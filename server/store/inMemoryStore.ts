import { sampleOpportunities } from '../data/sampleOpportunities.js';

export interface InMemoryUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  education: string;
  skills: string[];
  preferredLocation: string;
  preferredCategory: string;
  createdAt: string;
}

export interface InMemorySavedJob {
  _id: string;
  userId: string;
  opportunityId: string;
  createdAt: string;
}

export interface InMemoryApplication {
  _id: string;
  userId: string;
  opportunityId: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Selected' | 'Rejected';
  appliedAt: string;
  updatedAt: string;
}

// Initial demo user
const defaultUser: InMemoryUser = {
  _id: "user-default-1",
  name: "Sailaja Kotla",
  email: "kotlasailaja2006@gmail.com",
  password: "password123",
  education: "B.Tech Final Year (Computer Science Engineering)",
  skills: ["Python", "SQL", "HTML", "CSS"],
  preferredLocation: "Visakhapatnam",
  preferredCategory: "Software Development",
  createdAt: new Date("2026-08-15").toISOString()
};

// Initial demo applications
const initialApplications: InMemoryApplication[] = [
  {
    _id: "app-1",
    userId: "user-default-1",
    opportunityId: "opp-101", // Python Developer Intern
    status: "Applied",
    appliedAt: new Date("2026-09-01").toISOString(),
    updatedAt: new Date("2026-09-02").toISOString()
  },
  {
    _id: "app-2",
    userId: "user-default-1",
    opportunityId: "opp-102", // Frontend Developer Intern
    status: "Interview",
    appliedAt: new Date("2026-08-30").toISOString(),
    updatedAt: new Date("2026-09-03").toISOString()
  },
  {
    _id: "app-3",
    userId: "user-default-1",
    opportunityId: "opp-103", // Data Analyst Intern
    status: "Saved",
    appliedAt: new Date("2026-09-04").toISOString(),
    updatedAt: new Date("2026-09-04").toISOString()
  }
];

const initialSavedJobs: InMemorySavedJob[] = [
  {
    _id: "saved-1",
    userId: "user-default-1",
    opportunityId: "opp-103",
    createdAt: new Date("2026-09-04").toISOString()
  },
  {
    _id: "saved-2",
    userId: "user-default-1",
    opportunityId: "opp-106",
    createdAt: new Date("2026-09-04").toISOString()
  }
];

export class InMemoryStore {
  opportunities = [...sampleOpportunities];
  users: InMemoryUser[] = [defaultUser];
  savedJobs: InMemorySavedJob[] = [...initialSavedJobs];
  applications: InMemoryApplication[] = [...initialApplications];

  // Opportunities
  getOpportunities(filters?: {
    search?: string;
    location?: string;
    category?: string;
    type?: string;
    skill?: string;
  }) {
    let result = [...this.opportunities];

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(opp =>
        opp.title.toLowerCase().includes(q) ||
        opp.company.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q) ||
        opp.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    if (filters?.location && filters.location !== 'All') {
      result = result.filter(opp => opp.location.toLowerCase() === filters.location!.toLowerCase());
    }

    if (filters?.category && filters.category !== 'All') {
      result = result.filter(opp => opp.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.type && filters.type !== 'All') {
      result = result.filter(opp => opp.type.toLowerCase() === filters.type!.toLowerCase());
    }

    if (filters?.skill && filters.skill !== 'All') {
      result = result.filter(opp => opp.skills.some(s => s.toLowerCase() === filters.skill!.toLowerCase()));
    }

    return result;
  }

  getOpportunityById(id: string) {
    return this.opportunities.find(opp => opp._id === id || (opp as any).id === id);
  }

  createOpportunity(data: any) {
    const newOpp = {
      _id: `opp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...data
    };
    this.opportunities.unshift(newOpp);
    return newOpp;
  }

  // Users
  getUserById(id: string) {
    return this.users.find(u => u._id === id) || this.users[0];
  }

  getUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  upsertUser(data: Partial<InMemoryUser>) {
    let user = this.users.find(u => (data._id && u._id === data._id) || (data.email && u.email.toLowerCase() === data.email.toLowerCase()));
    if (user) {
      Object.assign(user, data);
      return user;
    } else {
      const newUser: InMemoryUser = {
        _id: data._id || `user-${Date.now()}`,
        name: data.name || "Student User",
        email: data.email || "student@example.com",
        password: data.password || "password123",
        education: data.education || "Undergraduate Student",
        skills: data.skills || ["Python", "SQL"],
        preferredLocation: data.preferredLocation || "Visakhapatnam",
        preferredCategory: data.preferredCategory || "Software Development",
        createdAt: new Date().toISOString()
      };
      this.users.push(newUser);
      return newUser;
    }
  }

  // Saved Jobs
  getSavedJobs(userId: string) {
    const saved = this.savedJobs.filter(s => s.userId === userId);
    return saved.map(s => {
      const opp = this.getOpportunityById(s.opportunityId);
      return {
        ...s,
        opportunity: opp
      };
    });
  }

  toggleSaveJob(userId: string, opportunityId: string) {
    const existingIndex = this.savedJobs.findIndex(s => s.userId === userId && s.opportunityId === opportunityId);
    if (existingIndex >= 0) {
      this.savedJobs.splice(existingIndex, 1);
      return { saved: false, message: "Opportunity removed from saved list" };
    } else {
      const newSaved: InMemorySavedJob = {
        _id: `saved-${Date.now()}`,
        userId,
        opportunityId,
        createdAt: new Date().toISOString()
      };
      this.savedJobs.push(newSaved);
      return { saved: true, savedJob: newSaved, message: "Opportunity saved successfully" };
    }
  }

  deleteSavedJob(idOrOppId: string, userId?: string) {
    const index = this.savedJobs.findIndex(s => s._id === idOrOppId || (userId && s.userId === userId && s.opportunityId === idOrOppId));
    if (index >= 0) {
      this.savedJobs.splice(index, 1);
      return true;
    }
    return false;
  }

  // Applications
  getApplications(userId: string) {
    const apps = this.applications.filter(a => a.userId === userId);
    return apps.map(a => {
      const opp = this.getOpportunityById(a.opportunityId);
      return {
        ...a,
        opportunity: opp
      };
    });
  }

  createOrUpdateApplication(userId: string, opportunityId: string, status: 'Saved' | 'Applied' | 'Interview' | 'Selected' | 'Rejected') {
    let app = this.applications.find(a => a.userId === userId && a.opportunityId === opportunityId);
    if (app) {
      app.status = status;
      app.updatedAt = new Date().toISOString();
      return app;
    } else {
      const newApp: InMemoryApplication = {
        _id: `app-${Date.now()}`,
        userId,
        opportunityId,
        status,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.applications.push(newApp);
      return newApp;
    }
  }

  updateApplicationStatus(id: string, status: 'Saved' | 'Applied' | 'Interview' | 'Selected' | 'Rejected') {
    const app = this.applications.find(a => a._id === id);
    if (app) {
      app.status = status;
      app.updatedAt = new Date().toISOString();
      return app;
    }
    return null;
  }
}

export const memoryStore = new InMemoryStore();
