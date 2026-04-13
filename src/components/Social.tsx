import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { UserProfile, Friendship, OperationType, FeedEvent, Reaction } from '../types';
import { Users, UserPlus, Check, Clock, TrendingUp, MessageSquare, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SocialProps {
  user: User;
  profile: UserProfile | null;
}

export default function Social({ user, profile }: SocialProps) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [friendsProfiles, setFriendsProfiles] = useState<UserProfile[]>([]);
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q1 = query(collection(db, 'friendships'), where('user1', '==', user.uid));
    const q2 = query(collection(db, 'friendships'), where('user2', '==', user.uid));

    const unsub1 = onSnapshot(q1, (snap) => {
      const f1 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
      setFriendships(prev => {
        const other = prev.filter(f => f.user1 !== user.uid);
        return [...other, ...f1];
      });
    });

    const unsub2 = onSnapshot(q2, (snap) => {
      const f2 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Friendship));
      setFriendships(prev => {
        const other = prev.filter(f => f.user2 !== user.uid);
        return [...other, ...f2];
      });
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  useEffect(() => {
    const feedQuery = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), limit(20));
    const unsubFeed = onSnapshot(feedQuery, (snap) => {
      setFeedEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedEvent)));
    });

    const reactionQuery = query(collection(db, 'reactions'), limit(100));
    const unsubReactions = onSnapshot(reactionQuery, (snap) => {
      setReactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reaction)));
    });

    return () => {
      unsubFeed();
      unsubReactions();
    };
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      const friendUids = friendships
        .filter(f => f.status === 'accepted')
        .map(f => f.user1 === user.uid ? f.user2 : f.user1);
      
      const profiles: UserProfile[] = [];
      for (const uid of friendUids) {
        const d = await getDoc(doc(db, 'users', uid));
        if (d.exists()) profiles.push(d.data() as UserProfile);
      }
      setFriendsProfiles(profiles);
    };

    if (friendships.length > 0) fetchFriends();
  }, [friendships, user.uid]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail));
      const unsub = onSnapshot(q, async (snap) => {
        if (!snap.empty) {
          const targetUser = snap.docs[0].data() as UserProfile;
          if (targetUser.uid === user.uid) {
            alert("You can't add yourself!");
            return;
          }
          
          await addDoc(collection(db, 'friendships'), {
            user1: user.uid,
            user2: targetUser.uid,
            status: 'pending',
            createdAt: serverTimestamp()
          });
          setSearchEmail('');
          alert("Friend request sent!");
        } else {
          alert("User not found.");
        }
        unsub();
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'friendships');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReaction = async (eventId: string, type: 'kudos' | 'keep_it_up') => {
    try {
      await addDoc(collection(db, 'reactions'), {
        eventId,
        uid: user.uid,
        type,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reactions');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Terminal</h1>
          <p className="text-on-surface-variant">Connect with peers and encourage academic progress.</p>
        </div>
        <Users className="w-8 h-8 text-primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Social Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Live Feed
            </h3>
            <div className="space-y-6">
              {feedEvents.map(event => {
                const eventReactions = reactions.filter(r => r.eventId === event.id);
                const isMyEvent = event.uid === user.uid;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, x: 5, rotateY: 2 }}
                    whileTap={{ scale: 0.98, rotateX: 2 }}
                    key={event.id} 
                    className="flex gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/5 cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm">
                          <span className="font-bold">{isMyEvent ? 'You' : event.userName}</span>
                          <span className="text-on-surface-variant"> {event.content}</span>
                        </p>
                        <span className="text-[10px] text-on-surface-variant uppercase font-bold">
                          {event.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <motion.button 
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9, rotate: 5 }}
                          onClick={() => handleReaction(event.id, 'kudos')}
                          className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant/10 rounded-full text-[11px] font-bold hover:bg-primary/5 hover:border-primary/20 transition-all"
                        >
                          <Heart className="w-3 h-3 text-red-500" />
                          Kudos {eventReactions.filter(r => r.type === 'kudos').length || ''}
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9, rotate: -5 }}
                          onClick={() => handleReaction(event.id, 'keep_it_up')}
                          className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest border border-outline-variant/10 rounded-full text-[11px] font-bold hover:bg-primary/5 hover:border-primary/20 transition-all"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          Keep it up {eventReactions.filter(r => r.type === 'keep_it_up').length || ''}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {feedEvents.length === 0 && (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-on-surface-variant/30" />
                  </div>
                  <p className="text-on-surface-variant text-sm italic">
                    The feed is quiet. Start by adding a course or a grade!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Friends & Requests */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Add Peer
            </h3>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <input 
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full input-field"
                placeholder="peer@school.edu"
                required
              />
              <motion.button 
                whileHover={{ scale: 1.02, rotateX: -5 }}
                whileTap={{ scale: 0.98, rotateX: 5 }}
                type="submit"
                disabled={isSearching}
                className="w-full btn-primary text-xs"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {isSearching ? 'Searching...' : 'Send Request'}
              </motion.button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Friends ({friendsProfiles.length})
            </h3>
            <div className="space-y-4">
              {friendsProfiles.map(friend => (
                <div key={friend.uid} className="flex items-center gap-3">
                  <img src={friend.photoURL || ''} className="w-8 h-8 rounded-full bg-on-surface/10" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{friend.displayName}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                      Top 6: {friend.top6Projection || '??'}%
                    </p>
                  </div>
                </div>
              ))}
              {friendsProfiles.length === 0 && (
                <p className="text-xs text-on-surface-variant italic">No friends yet.</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Pending
            </h3>
            <div className="space-y-3">
              {friendships.filter(f => f.status === 'pending').map(f => (
                <div key={f.id} className="flex items-center justify-between p-2 bg-surface-container-low rounded-md text-xs">
                  <span className="truncate max-w-[100px]">
                    {f.user1 === user.uid ? 'Sent' : 'Incoming'}
                  </span>
                  {f.user2 === user.uid && (
                    <button className="text-primary font-bold hover:underline">Accept</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
