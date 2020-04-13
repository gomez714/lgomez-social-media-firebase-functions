let db = {
    users: [
        {
            userId: 'dh23ggj5h32g543j5gf43',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2020-04-01T03:34:34.079Z',
            imageUrl: 'image/dskfsdfl/dksjf',
            bio: 'Hello, my name is user, nice to meet you',
            website: 'https://user.com',
            location: 'london, UK'
        }
    ],
    crafts: [
        {
            userHandle: 'user',
            body: 'this is the craft body',
            createdAt: '2019-03-15T11:56:01:018Z',
            likeCount: 5,
            commentCount: 2
        }
    ],
    comments: [
        {    
            userHandle: 'user',
            craftId: 'asdfnljkdfn',
            body: "Nice one dude!",
            createdAt: '2019-03-15T11:56:01:018Z'
        }
    ],
    notifications: [
        {
            recipient: "user",
            sender: "john",
            read: 'true | false',
            craftId: 'sdjhfsdhfaj',
            type: 'like | comment',
            createdAt: '2019-03-15T11:56:01:018Z'
        }
    ]
}

const userDetails = {
    credentials: {
        userId: 'dh23ggj5h32g543j5gf43',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2020-04-01T03:34:34.079Z',
        imageUrl: 'image/dskfsdfl/dksjf',
        bio: 'Hello, my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'Anaheim, CA'
    },
    likes: [
        {
            userHandle: 'user',
            craftId: 'hh7O5oWfWucVzGbHH2pa'
        },
        {
            userHandle: 'user',
            craftId: '3IOnFoQexRcofs5OhBXO'
        }
    ]
}