package com.seps.admin.suptech.service;

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
import java.util.Locale;
import java.util.Map;

@Service
public class LdapSearchService {

    private static final Logger LOG = LoggerFactory.getLogger(LdapSearchService.class);
    private static final String LDAP_URL = "ldap://abnoba.seps.local:389";
    private static final String BASE_DN = "DC=SEPS,DC=local";
    private static final String LDAP_USERNAME = "CN=suptech,OU=Cambrigde,DC=SEPS,DC=local";
    private static final String LDAP_PASSWORD = "Must4n8_2k2G";

    @Autowired
    private MessageSource messageSource;

    public Map<String, String> searchByEmail(String email) throws UserNotFoundException {
        Map<String, String> userDetails = new HashMap<>();
        DirContext ctx = null;
        try {
            // Set up the environment for LDAP connection
            Hashtable<String, String> env = new Hashtable<>();
            env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
            env.put(Context.PROVIDER_URL, LDAP_URL);
            env.put(Context.SECURITY_PRINCIPAL, LDAP_USERNAME);
            env.put(Context.SECURITY_CREDENTIALS, LDAP_PASSWORD);
            env.put(Context.SECURITY_AUTHENTICATION, "simple");
            // Create the DirContext
            ctx = new InitialDirContext(env);
            // Create the search filter
            String searchFilter = "(&(mail=" + email + "))";
            SearchControls searchControls = new SearchControls();
            searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
            // Perform the search
            NamingEnumeration<SearchResult> results = ctx.search(BASE_DN, searchFilter, searchControls);
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

}
