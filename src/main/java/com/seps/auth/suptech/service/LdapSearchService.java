package com.seps.auth.suptech.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.*;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

@Service
public class LdapSearchService {

    private static final Logger LOG = LoggerFactory.getLogger(LdapSearchService.class);
    @Autowired
    private LdapConfig ldapConfig;

    @Autowired
    private MessageSource messageSource;

    public Map<String, String> searchByEmail(String email) throws UserNotFoundException {
        Map<String, String> userDetails = new HashMap<>();
        DirContext ctx = null;
        try {
            // Set up the environment for LDAP connection
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapConfig.getUrl());
            env.put(Context.SECURITY_PRINCIPAL, ldapConfig.getUsername());
            env.put(Context.SECURITY_CREDENTIALS, ldapConfig.getPassword());
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            // Create the DirContext
            ctx = new InitialDirContext(env);
            // Create the search filter
            String searchFilter = "(&(mail=" + email + "))";
            SearchControls searchControls = new SearchControls();
            searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            // Perform the search
            NamingEnumeration<SearchResult> results = ctx.search(ldapConfig.getBasedn(), searchFilter, searchControls);
            if (results.hasMore()) {
                SearchResult result = results.next();
                NamingEnumeration<? extends Attribute> attributes = result.getAttributes().getAll();
                while (attributes.hasMore()) {
                    Attribute attribute = attributes.next();
                    userDetails.put(attribute.getID(), attribute.get().toString());
                }
            } else {
                throw new UserNotFoundException(
                    messageSource.getMessage("ldap.user.not.found", new Object[]{email}, LocaleContextHolder.getLocale())
                );
            }
        } catch (Exception e) {
            LOG.error("Exception message:{}", e.getMessage());
            if (e instanceof AuthenticationException) {
                throw new RuntimeException(
                    messageSource.getMessage("ldap.auth.problem", null, LocaleContextHolder.getLocale())
                );
            }// Re-throw UserNotFoundException or wrap general exceptions
            else if (e instanceof NamingException) {
                throw new UserNotFoundException(
                    messageSource.getMessage("ldap.user.not.found", new Object[]{email}, LocaleContextHolder.getLocale())
                );
            } else {
                throw new UserNotFoundException(
                    messageSource.getMessage("ldap.search.error", null, LocaleContextHolder.getLocale())
                );
            }
        } finally {
            if (ctx != null) {
                try {
                    ctx.close();
                } catch (NamingException e) {
                    LOG.error("Failed to close the LDAP context: {}", e.getMessage());
                }
            }
        }
        return userDetails;
    }

    public boolean authenticate(String email, String password) {
        LOG.debug("Authenticating user with email: {}", email);
        DirContext ctx = null;
        try {
            // Fetch user details to get the distinguished name (DN)
            Map<String, String> userDetails = searchByEmail(email);
            String distinguishedName = userDetails.get("distinguishedName"); // Ensure your LDAP contains this attribute
            if (distinguishedName == null) {
                LOG.warn("Distinguished name not found for email: {}", email);
                return false; // Cannot authenticate without DN
            }
            //String distinguishedName = "CN=singh hanwant,OU=Cambrigde,DC=SEPS,DC=local";
            // Set up the environment for LDAP authentication
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, ldapConfig.getUrl());
            env.put(Context.SECURITY_PRINCIPAL, distinguishedName); // Use DN for authentication
            env.put(Context.SECURITY_CREDENTIALS, password);
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            // Attempt to establish a connection
            ctx = new InitialDirContext(env);
            LOG.info("Authentication successful for email: {}", email);
            return true; // Authentication succeeded
        } catch (AuthenticationException e) {
            LOG.warn("Authentication failed for email: {}", email);
            return false; // Authentication failed
        }
//        catch (UserNotFoundException e) {
//            LOG.warn("User not found for email: {}", email);
//            return false; // User does not exist
//        }
        catch (Exception e) {
            LOG.error("Error during authentication for email: {}. Message: {}", email, e.getMessage());
            throw new RuntimeException(
                messageSource.getMessage("ldap.auth.problem", null, LocaleContextHolder.getLocale())
            );
        } finally {
            if (ctx != null) {
                try {
                    ctx.close();
                } catch (NamingException e) {
                    LOG.error("Failed to close the LDAP context: {}", e.getMessage());
                }
            }
        }
    }
}
